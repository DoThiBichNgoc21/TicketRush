-- 1. Thêm cột vào bảng bookings để lưu thông tin giảm giá
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS discount_id BIGINT REFERENCES discount_codes(id),
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;

-- 2. Cập nhật hàm confirm_booking để hỗ trợ giảm giá
CREATE OR REPLACE FUNCTION confirm_booking(
  p_user_id BIGINT,
  p_event_id BIGINT,
  p_showtime_id BIGINT,
  p_seat_ids BIGINT[],
  p_total_amount NUMERIC,
  p_discount_id BIGINT DEFAULT NULL,
  p_discount_amount NUMERIC DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seat_id BIGINT;
  v_seat seating_chart%ROWTYPE;
  v_booking_id BIGINT;
  v_computed_total NUMERIC := 0;
  v_hold_seconds INTEGER := 600;
  v_now TIMESTAMPTZ := NOW();
  v_discount_record RECORD;
BEGIN
  -- Kiểm tra đầu vào
  IF p_user_id IS NULL OR p_event_id IS NULL OR p_showtime_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_INPUT', 'message', 'Thiếu tham số');
  END IF;
  IF p_seat_ids IS NULL OR array_length(p_seat_ids, 1) IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'NO_SEATS', 'message', 'Chưa chọn ghế');
  END IF;

  -- Nhả các khóa đã hết hạn trước khi kiểm tra
  PERFORM expire_stale_seat_locks(v_hold_seconds);

  -- Tính tổng tiền gốc từ các ghế
  FOR v_seat_id IN SELECT s.id FROM unnest(p_seat_ids) AS s(id) ORDER BY s.id LOOP
    SELECT * INTO v_seat FROM seating_chart WHERE id = v_seat_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'SEAT_NOT_FOUND:%', v_seat_id; END IF;
    IF v_seat.showtime_id IS DISTINCT FROM p_showtime_id THEN RAISE EXCEPTION 'SEAT_WRONG_SHOWTIME:%', v_seat_id; END IF;
    IF v_seat.status = 'sold' THEN RAISE EXCEPTION 'SEAT_ALREADY_SOLD:%', v_seat_id; END IF;
    
    -- Kiểm tra trạng thái locked
    IF v_seat.status = 'locked' THEN
      IF v_seat.user_id IS DISTINCT FROM p_user_id THEN RAISE EXCEPTION 'SEAT_LOCKED_BY_OTHER:%', v_seat_id; END IF;
      IF v_seat.locked_at IS NOT NULL AND v_seat.locked_at + (v_hold_seconds || ' seconds')::INTERVAL < v_now THEN
        RAISE EXCEPTION 'SEAT_HOLD_EXPIRED:%', v_seat_id;
      END IF;
    ELSIF v_seat.status <> 'available' THEN
      RAISE EXCEPTION 'SEAT_UNAVAILABLE:%', v_seat_id;
    END IF;
    
    v_computed_total := v_computed_total + COALESCE(v_seat.price, 0);
  END LOOP;

  -- Kiểm tra khớp giá tiền (sau khi trừ giảm giá)
  IF round((v_computed_total - COALESCE(p_discount_amount, 0))::numeric, 2) <> round(COALESCE(p_total_amount, 0)::numeric, 2) THEN
    RETURN jsonb_build_object(
      'success', false, 
      'code', 'PRICE_MISMATCH', 
      'message', 'Tổng tiền không khớp', 
      'expected_final', (v_computed_total - COALESCE(p_discount_amount, 0)),
      'computed_original', v_computed_total
    );
  END IF;

  -- Kiểm tra mã giảm giá nếu có
  IF p_discount_id IS NOT NULL THEN
    SELECT * INTO v_discount_record FROM discount_codes WHERE id = p_discount_id FOR UPDATE;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'code', 'DISCOUNT_NOT_FOUND', 'message', 'Mã giảm giá không tồn tại');
    END IF;
    IF v_discount_record.status <> 'active' THEN
      RETURN jsonb_build_object('success', false, 'code', 'DISCOUNT_INACTIVE', 'message', 'Mã giảm giá không còn hiệu lực');
    END IF;
    IF v_discount_record.usage_limit IS NOT NULL AND v_discount_record.used_count >= v_discount_record.usage_limit THEN
      RETURN jsonb_build_object('success', false, 'code', 'DISCOUNT_LIMIT_REACHED', 'message', 'Thành thật xin lỗi, mã giảm giá này đã hết lượt sử dụng');
    END IF;
    
    -- Cập nhật số lượt đã dùng
    UPDATE discount_codes SET used_count = used_count + 1 WHERE id = p_discount_id;
  END IF;

  -- Tạo đơn hàng (booking)
  INSERT INTO bookings (user_id, event_id, total_amount, status, discount_id, discount_amount)
  VALUES (p_user_id, p_event_id, p_total_amount, 'Paid', p_discount_id, p_discount_amount)
  RETURNING id INTO v_booking_id;

  -- Tạo vé cho từng ghế
  FOR v_seat_id IN SELECT s.id FROM unnest(p_seat_ids) AS s(id) ORDER BY s.id LOOP
    SELECT * INTO v_seat FROM seating_chart WHERE id = v_seat_id FOR UPDATE;
    INSERT INTO tickets (booking_id, seat_id, price, ticket_type)
    VALUES (v_booking_id, v_seat_id, COALESCE(v_seat.price, 0), COALESCE(v_seat.seat_type, 'Standard'));
    
    -- Chuyển trạng thái ghế sang sold
    UPDATE seating_chart SET status = 'sold', user_id = p_user_id, locked_at = NULL WHERE id = v_seat_id;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'status', 'Paid',
    'message', 'Thanh toán thành công'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'code', 'BOOKING_FAILED', 'message', SQLERRM);
END;
$$;

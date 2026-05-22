-- Vòng đời ghế: available -> locked -> sold | (hết hạn) -> available (released)
-- Phiên giữ: 10 phút từ ghế đầu tiên cùng suất (các ghế sau dùng chung mốc locked_at)

CREATE OR REPLACE FUNCTION expire_stale_seat_locks(p_hold_seconds INTEGER DEFAULT 600)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_ids BIGINT[];
BEGIN
  WITH expired AS (
    UPDATE seating_chart
    SET
      status = 'available',
      user_id = NULL,
      locked_at = NULL
    WHERE status = 'locked'
      AND locked_at IS NOT NULL
      AND locked_at + (p_hold_seconds || ' seconds')::INTERVAL < NOW()
    RETURNING id
  )
  SELECT COUNT(*)::INTEGER, COALESCE(array_agg(id), '{}')
  INTO v_count, v_ids
  FROM expired;

  RETURN jsonb_build_object(
    'released_count', v_count,
    'released_seat_ids', v_ids,
    'message', CASE WHEN v_count > 0 THEN 'Đã nhả ghế hết hạn giữ chỗ' ELSE 'Không có ghế hết hạn' END
  );
END;
$$;

CREATE OR REPLACE FUNCTION hold_seat(
  p_seat_id BIGINT,
  p_user_id BIGINT,
  p_hold_seconds INTEGER DEFAULT 600
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seat seating_chart%ROWTYPE;
  v_now TIMESTAMPTZ := NOW();
  v_hold_until TIMESTAMPTZ;
  v_session_start TIMESTAMPTZ;
  v_lock_at TIMESTAMPTZ;
BEGIN
  IF p_seat_id IS NULL OR p_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_INPUT', 'message', 'Thiếu seat_id hoặc user_id');
  END IF;

  PERFORM expire_stale_seat_locks(p_hold_seconds);

  SELECT * INTO v_seat FROM seating_chart WHERE id = p_seat_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'NOT_FOUND', 'message', 'Ghế không tồn tại');
  END IF;

  IF v_seat.status = 'locked'
     AND v_seat.locked_at IS NOT NULL
     AND v_seat.locked_at + (p_hold_seconds || ' seconds')::INTERVAL < v_now
  THEN
    UPDATE seating_chart SET status = 'available', user_id = NULL, locked_at = NULL WHERE id = p_seat_id;
    SELECT * INTO v_seat FROM seating_chart WHERE id = p_seat_id FOR UPDATE;
  END IF;

  IF v_seat.status = 'sold' THEN
    RETURN jsonb_build_object('success', false, 'code', 'SOLD', 'message', 'Ghế đã được bán');
  END IF;

  SELECT MIN(locked_at) INTO v_session_start
  FROM seating_chart
  WHERE showtime_id = v_seat.showtime_id
    AND user_id = p_user_id
    AND status = 'locked'
    AND locked_at IS NOT NULL;

  IF v_session_start IS NOT NULL THEN
    v_lock_at := v_session_start;
    v_hold_until := v_session_start + (p_hold_seconds || ' seconds')::INTERVAL;
    IF v_hold_until <= v_now THEN
      RETURN jsonb_build_object('success', false, 'code', 'SESSION_EXPIRED', 'message', 'Phiên giữ ghế đã hết hạn, vui lòng chọn lại');
    END IF;
  ELSE
    v_lock_at := v_now;
    v_hold_until := v_now + (p_hold_seconds || ' seconds')::INTERVAL;
  END IF;

  IF v_seat.status = 'locked' THEN
    IF v_seat.user_id = p_user_id THEN
      UPDATE seating_chart SET locked_at = v_lock_at WHERE id = p_seat_id;
      SELECT * INTO v_seat FROM seating_chart WHERE id = p_seat_id;
      RETURN jsonb_build_object(
        'success', true, 'code', 'RENEWED',
        'message', 'Ghế đã trong giỏ',
        'held_until', v_hold_until,
        'session_locked_at', v_lock_at,
        'seat', to_jsonb(v_seat)
      );
    END IF;
    RETURN jsonb_build_object('success', false, 'code', 'LOCKED_BY_OTHER', 'message', 'Ghế đang được người khác giữ');
  END IF;

  IF v_seat.status = 'available' THEN
    UPDATE seating_chart
    SET status = 'locked', user_id = p_user_id, locked_at = v_lock_at
    WHERE id = p_seat_id AND status = 'available';

    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'code', 'RACE_LOST', 'message', 'Ghế vừa được người khác giữ');
    END IF;

    SELECT * INTO v_seat FROM seating_chart WHERE id = p_seat_id;
    RETURN jsonb_build_object(
      'success', true,
      'code', 'HELD',
      'message', 'Giữ ghế thành công',
      'held_until', v_hold_until,
      'session_locked_at', v_lock_at,
      'seat', to_jsonb(v_seat)
    );
  END IF;

  RETURN jsonb_build_object('success', false, 'code', 'UNAVAILABLE', 'message', 'Ghế không khả dụng');
END;
$$;

-- Thanh toán giả lập: đặt vé status Paid, ghế -> sold
CREATE OR REPLACE FUNCTION confirm_booking(
  p_user_id BIGINT,
  p_event_id BIGINT,
  p_showtime_id BIGINT,
  p_seat_ids BIGINT[],
  p_total_amount NUMERIC
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
BEGIN
  IF p_user_id IS NULL OR p_event_id IS NULL OR p_showtime_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_INPUT', 'message', 'Thiếu tham số');
  END IF;
  IF p_seat_ids IS NULL OR array_length(p_seat_ids, 1) IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'NO_SEATS', 'message', 'Chưa chọn ghế');
  END IF;

  PERFORM expire_stale_seat_locks(v_hold_seconds);

  FOR v_seat_id IN SELECT s.id FROM unnest(p_seat_ids) AS s(id) ORDER BY s.id LOOP
    SELECT * INTO v_seat FROM seating_chart WHERE id = v_seat_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'SEAT_NOT_FOUND:%', v_seat_id; END IF;
    IF v_seat.showtime_id IS DISTINCT FROM p_showtime_id THEN RAISE EXCEPTION 'SEAT_WRONG_SHOWTIME:%', v_seat_id; END IF;
    IF v_seat.status = 'sold' THEN RAISE EXCEPTION 'SEAT_ALREADY_SOLD:%', v_seat_id; END IF;
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

  IF round(v_computed_total::numeric, 2) <> round(COALESCE(p_total_amount, 0)::numeric, 2) THEN
    RETURN jsonb_build_object('success', false, 'code', 'PRICE_MISMATCH', 'message', 'Tổng tiền không khớp', 'expected', v_computed_total);
  END IF;

  INSERT INTO bookings (user_id, event_id, total_amount, status)
  VALUES (p_user_id, p_event_id, p_total_amount, 'Paid')
  RETURNING id INTO v_booking_id;

  FOR v_seat_id IN SELECT s.id FROM unnest(p_seat_ids) AS s(id) ORDER BY s.id LOOP
    SELECT * INTO v_seat FROM seating_chart WHERE id = v_seat_id FOR UPDATE;
    INSERT INTO tickets (booking_id, seat_id, price, ticket_type)
    VALUES (v_booking_id, v_seat_id, COALESCE(v_seat.price, 0), COALESCE(v_seat.seat_type, 'Standard'));
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

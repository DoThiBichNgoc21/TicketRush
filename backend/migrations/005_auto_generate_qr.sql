-- Auto generate QR code khi insert ticket trong confirm_booking
-- Tạo lại function confirm_booking để tạo QR code tự động

DROP FUNCTION IF EXISTS confirm_booking(BIGINT, BIGINT, BIGINT, BIGINT[], NUMERIC) CASCADE;

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
  v_ticket_id BIGINT;
  v_ticket_code TEXT;
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
  VALUES (p_user_id, p_event_id, p_total_amount, 'Confirmed')
  RETURNING id INTO v_booking_id;

  FOR v_seat_id IN SELECT s.id FROM unnest(p_seat_ids) AS s(id) ORDER BY s.id LOOP
    SELECT * INTO v_seat FROM seating_chart WHERE id = v_seat_id FOR UPDATE;
    
    -- Insert ticket
    INSERT INTO tickets (booking_id, seat_id, price, ticket_type)
    VALUES (v_booking_id, v_seat_id, COALESCE(v_seat.price, 0), COALESCE(v_seat.seat_type, 'Standard'))
    RETURNING id INTO v_ticket_id;
    
    -- Tạo QR code tự động
    v_ticket_code := CONCAT(
      v_booking_id, '-',
      v_ticket_id, '-',
      p_user_id, '-',
      TO_CHAR(NOW(), 'YYYYMMDDHHmmss')
    );
    
    UPDATE tickets
    SET qr_code = v_ticket_code,
        qr_generated_at = NOW()
    WHERE id = v_ticket_id;
    
    UPDATE seating_chart SET status = 'sold', user_id = p_user_id, locked_at = NULL WHERE id = v_seat_id;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'status', 'Confirmed',
    'message', 'Đặt vé thành công'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'code', 'BOOKING_FAILED', 'message', SQLERRM);
END;
$$;

-- Tạo QR code cho tất cả tickets cũ chưa có QR
UPDATE tickets
SET 
  qr_code = CONCAT(
    booking_id, '-',
    id, '-',
    (SELECT user_id FROM bookings WHERE id = booking_id), '-',
    TO_CHAR(NOW(), 'YYYYMMDDHHmmss')
  ),
  qr_generated_at = NOW()
WHERE qr_code IS NULL;

-- Update status của bookings cũ từ 'Paid' -> 'Confirmed'
UPDATE bookings
SET status = 'Confirmed'
WHERE status = 'Paid';

GRANT EXECUTE ON FUNCTION confirm_booking(BIGINT, BIGINT, BIGINT, BIGINT[], NUMERIC) TO service_role;

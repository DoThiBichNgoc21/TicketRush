-- Chạy sau 001 nếu gặp lỗi: invalid input syntax for type uuid
-- Bảng seating_chart / users dùng BIGINT id, không phải UUID

DROP FUNCTION IF EXISTS hold_seat(UUID, UUID, INTEGER);
DROP FUNCTION IF EXISTS release_seat(UUID, UUID);
DROP FUNCTION IF EXISTS release_seats(UUID[], UUID);
DROP FUNCTION IF EXISTS confirm_booking(UUID, UUID, UUID, UUID[], NUMERIC);

DROP FUNCTION IF EXISTS hold_seat(BIGINT, BIGINT, INTEGER);
DROP FUNCTION IF EXISTS release_seat(BIGINT, BIGINT);
DROP FUNCTION IF EXISTS release_seats(BIGINT[], BIGINT);
DROP FUNCTION IF EXISTS confirm_booking(BIGINT, BIGINT, BIGINT, BIGINT[], NUMERIC);

-- Giữ một ghế
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
BEGIN
  IF p_seat_id IS NULL OR p_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_INPUT', 'message', 'Thiếu seat_id hoặc user_id');
  END IF;

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

  IF v_seat.status = 'locked' THEN
    IF v_seat.user_id = p_user_id THEN
      UPDATE seating_chart SET locked_at = v_now WHERE id = p_seat_id;
      v_hold_until := v_now + (p_hold_seconds || ' seconds')::INTERVAL;
      SELECT * INTO v_seat FROM seating_chart WHERE id = p_seat_id;
      RETURN jsonb_build_object('success', true, 'code', 'RENEWED', 'message', 'Gia hạn giữ ghế', 'held_until', v_hold_until, 'seat', to_jsonb(v_seat));
    END IF;
    RETURN jsonb_build_object('success', false, 'code', 'LOCKED_BY_OTHER', 'message', 'Ghế đang được người khác giữ');
  END IF;

  IF v_seat.status = 'available' THEN
    UPDATE seating_chart SET status = 'locked', user_id = p_user_id, locked_at = v_now
    WHERE id = p_seat_id AND status = 'available';

    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'code', 'RACE_LOST', 'message', 'Ghế vừa được người khác giữ, vui lòng chọn ghế khác');
    END IF;

    v_hold_until := v_now + (p_hold_seconds || ' seconds')::INTERVAL;
    SELECT * INTO v_seat FROM seating_chart WHERE id = p_seat_id;
    RETURN jsonb_build_object('success', true, 'code', 'HELD', 'message', 'Giữ ghế thành công', 'held_until', v_hold_until, 'seat', to_jsonb(v_seat));
  END IF;

  RETURN jsonb_build_object('success', false, 'code', 'UNAVAILABLE', 'message', 'Ghế không khả dụng');
END;
$$;

CREATE OR REPLACE FUNCTION release_seat(p_seat_id BIGINT, p_user_id BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_seat seating_chart%ROWTYPE;
BEGIN
  SELECT * INTO v_seat FROM seating_chart WHERE id = p_seat_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'NOT_FOUND', 'message', 'Ghế không tồn tại');
  END IF;
  IF v_seat.status = 'sold' THEN
    RETURN jsonb_build_object('success', false, 'code', 'SOLD', 'message', 'Ghế đã bán');
  END IF;
  IF v_seat.status = 'locked' AND v_seat.user_id IS DISTINCT FROM p_user_id THEN
    RETURN jsonb_build_object('success', false, 'code', 'FORBIDDEN', 'message', 'Không thể bỏ giữ ghế của người khác');
  END IF;
  UPDATE seating_chart SET status = 'available', user_id = NULL, locked_at = NULL
  WHERE id = p_seat_id AND status = 'locked' AND (user_id = p_user_id OR user_id IS NULL);
  SELECT * INTO v_seat FROM seating_chart WHERE id = p_seat_id;
  RETURN jsonb_build_object('success', true, 'code', 'RELEASED', 'message', 'Đã bỏ giữ ghế', 'seat', to_jsonb(v_seat));
END;
$$;

CREATE OR REPLACE FUNCTION release_seats(p_seat_ids BIGINT[], p_user_id BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_id BIGINT; v_released INTEGER := 0;
BEGIN
  IF p_seat_ids IS NULL OR array_length(p_seat_ids, 1) IS NULL THEN
    RETURN jsonb_build_object('success', true, 'released', 0);
  END IF;
  FOREACH v_id IN ARRAY p_seat_ids LOOP
    UPDATE seating_chart SET status = 'available', user_id = NULL, locked_at = NULL
    WHERE id = v_id AND status = 'locked' AND user_id = p_user_id;
    IF FOUND THEN v_released := v_released + 1; END IF;
  END LOOP;
  RETURN jsonb_build_object('success', true, 'released', v_released);
END;
$$;

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
  VALUES (p_user_id, p_event_id, p_total_amount, 'Confirmed')
  RETURNING id INTO v_booking_id;

  FOR v_seat_id IN SELECT s.id FROM unnest(p_seat_ids) AS s(id) ORDER BY s.id LOOP
    SELECT * INTO v_seat FROM seating_chart WHERE id = v_seat_id FOR UPDATE;
    INSERT INTO tickets (booking_id, seat_id, price, ticket_type)
    VALUES (v_booking_id, v_seat_id, COALESCE(v_seat.price, 0), COALESCE(v_seat.seat_type, 'Standard'));
    UPDATE seating_chart SET status = 'sold', user_id = p_user_id, locked_at = NULL WHERE id = v_seat_id;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'booking_id', v_booking_id, 'message', 'Đặt vé thành công');
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'code', 'BOOKING_FAILED', 'message', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION hold_seat(BIGINT, BIGINT, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION release_seat(BIGINT, BIGINT) TO service_role;
GRANT EXECUTE ON FUNCTION release_seats(BIGINT[], BIGINT) TO service_role;
GRANT EXECUTE ON FUNCTION confirm_booking(BIGINT, BIGINT, BIGINT, BIGINT[], NUMERIC) TO service_role;

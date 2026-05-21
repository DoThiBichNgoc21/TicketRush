-- Chạy trong Supabase SQL Editor (một lần).
-- Giữ ghế an toàn: SELECT ... FOR UPDATE + transaction trong từng function.

-- Dọn khóa hết hạn (có thể gọi định kỳ hoặc trước khi đọc sơ đồ)
CREATE OR REPLACE FUNCTION expire_stale_seat_locks(p_hold_seconds INTEGER DEFAULT 600)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE seating_chart
  SET
    status = 'available',
    user_id = NULL,
    locked_at = NULL
  WHERE status = 'locked'
    AND locked_at IS NOT NULL
    AND locked_at + (p_hold_seconds || ' seconds')::INTERVAL < NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Giữ một ghế (click chọn)
CREATE OR REPLACE FUNCTION hold_seat(
  p_seat_id UUID,
  p_user_id UUID,
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
    RETURN jsonb_build_object(
      'success', false,
      'code', 'INVALID_INPUT',
      'message', 'Thiếu seat_id hoặc user_id'
    );
  END IF;

  SELECT * INTO v_seat
  FROM seating_chart
  WHERE id = p_seat_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'NOT_FOUND',
      'message', 'Ghế không tồn tại'
    );
  END IF;

  -- Hết hạn khóa cũ (người khác hoặc session cũ)
  IF v_seat.status = 'locked'
     AND v_seat.locked_at IS NOT NULL
     AND v_seat.locked_at + (p_hold_seconds || ' seconds')::INTERVAL < v_now
  THEN
    UPDATE seating_chart
    SET status = 'available', user_id = NULL, locked_at = NULL
    WHERE id = p_seat_id;

    SELECT * INTO v_seat FROM seating_chart WHERE id = p_seat_id FOR UPDATE;
  END IF;

  IF v_seat.status = 'sold' THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'SOLD',
      'message', 'Ghế đã được bán'
    );
  END IF;

  IF v_seat.status = 'locked' THEN
    IF v_seat.user_id = p_user_id THEN
      UPDATE seating_chart
      SET locked_at = v_now
      WHERE id = p_seat_id;

      v_hold_until := v_now + (p_hold_seconds || ' seconds')::INTERVAL;

      SELECT * INTO v_seat FROM seating_chart WHERE id = p_seat_id;

      RETURN jsonb_build_object(
        'success', true,
        'code', 'RENEWED',
        'message', 'Gia hạn giữ ghế',
        'held_until', v_hold_until,
        'seat', to_jsonb(v_seat)
      );
    END IF;

    RETURN jsonb_build_object(
      'success', false,
      'code', 'LOCKED_BY_OTHER',
      'message', 'Ghế đang được người khác giữ'
    );
  END IF;

  IF v_seat.status = 'available' THEN
    UPDATE seating_chart
    SET
      status = 'locked',
      user_id = p_user_id,
      locked_at = v_now
    WHERE id = p_seat_id
      AND status = 'available';

    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'success', false,
        'code', 'RACE_LOST',
        'message', 'Ghế vừa được người khác giữ, vui lòng chọn ghế khác'
      );
    END IF;

    v_hold_until := v_now + (p_hold_seconds || ' seconds')::INTERVAL;

    SELECT * INTO v_seat FROM seating_chart WHERE id = p_seat_id;

    RETURN jsonb_build_object(
      'success', true,
      'code', 'HELD',
      'message', 'Giữ ghế thành công',
      'held_until', v_hold_until,
      'seat', to_jsonb(v_seat)
    );
  END IF;

  RETURN jsonb_build_object(
    'success', false,
    'code', 'UNAVAILABLE',
    'message', 'Ghế không khả dụng'
  );
END;
$$;

-- Bỏ giữ một ghế
CREATE OR REPLACE FUNCTION release_seat(
  p_seat_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seat seating_chart%ROWTYPE;
BEGIN
  SELECT * INTO v_seat
  FROM seating_chart
  WHERE id = p_seat_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'NOT_FOUND', 'message', 'Ghế không tồn tại');
  END IF;

  IF v_seat.status = 'sold' THEN
    RETURN jsonb_build_object('success', false, 'code', 'SOLD', 'message', 'Ghế đã bán');
  END IF;

  IF v_seat.status = 'locked' AND v_seat.user_id IS DISTINCT FROM p_user_id THEN
    RETURN jsonb_build_object('success', false, 'code', 'FORBIDDEN', 'message', 'Không thể bỏ giữ ghế của người khác');
  END IF;

  UPDATE seating_chart
  SET status = 'available', user_id = NULL, locked_at = NULL
  WHERE id = p_seat_id
    AND status = 'locked'
    AND (user_id = p_user_id OR user_id IS NULL);

  SELECT * INTO v_seat FROM seating_chart WHERE id = p_seat_id;

  RETURN jsonb_build_object(
    'success', true,
    'code', 'RELEASED',
    'message', 'Đã bỏ giữ ghế',
    'seat', to_jsonb(v_seat)
  );
END;
$$;

-- Bỏ giữ nhiều ghế (hết timer / thoát trang)
CREATE OR REPLACE FUNCTION release_seats(
  p_seat_ids UUID[],
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_released INTEGER := 0;
BEGIN
  IF p_seat_ids IS NULL OR array_length(p_seat_ids, 1) IS NULL THEN
    RETURN jsonb_build_object('success', true, 'released', 0);
  END IF;

  FOREACH v_id IN ARRAY p_seat_ids
  LOOP
    UPDATE seating_chart
    SET status = 'available', user_id = NULL, locked_at = NULL
    WHERE id = v_id
      AND status = 'locked'
      AND user_id = p_user_id;

    IF FOUND THEN
      v_released := v_released + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'released', v_released);
END;
$$;

-- Xác nhận đặt vé: khóa tất cả ghế theo thứ tự id (tránh deadlock) trong một transaction
CREATE OR REPLACE FUNCTION confirm_booking(
  p_user_id UUID,
  p_event_id UUID,
  p_showtime_id UUID,
  p_seat_ids UUID[],
  p_total_amount NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seat_id UUID;
  v_seat seating_chart%ROWTYPE;
  v_booking_id UUID;
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

  FOR v_seat_id IN
    SELECT s.id FROM unnest(p_seat_ids) AS s(id) ORDER BY s.id
  LOOP
    SELECT * INTO v_seat
    FROM seating_chart
    WHERE id = v_seat_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'SEAT_NOT_FOUND:%', v_seat_id;
    END IF;

    IF v_seat.showtime_id IS DISTINCT FROM p_showtime_id THEN
      RAISE EXCEPTION 'SEAT_WRONG_SHOWTIME:%', v_seat_id;
    END IF;

    IF v_seat.status = 'sold' THEN
      RAISE EXCEPTION 'SEAT_ALREADY_SOLD:%', v_seat_id;
    END IF;

    IF v_seat.status = 'locked' THEN
      IF v_seat.user_id IS DISTINCT FROM p_user_id THEN
        RAISE EXCEPTION 'SEAT_LOCKED_BY_OTHER:%', v_seat_id;
      END IF;
      IF v_seat.locked_at IS NOT NULL
         AND v_seat.locked_at + (v_hold_seconds || ' seconds')::INTERVAL < v_now
      THEN
        RAISE EXCEPTION 'SEAT_HOLD_EXPIRED:%', v_seat_id;
      END IF;
    ELSIF v_seat.status <> 'available' THEN
      RAISE EXCEPTION 'SEAT_UNAVAILABLE:%', v_seat_id;
    END IF;

    v_computed_total := v_computed_total + COALESCE(v_seat.price, 0);
  END LOOP;

  IF round(v_computed_total::numeric, 2) <> round(COALESCE(p_total_amount, 0)::numeric, 2) THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'PRICE_MISMATCH',
      'message', 'Tổng tiền không khớp, vui lòng tải lại trang',
      'expected', v_computed_total
    );
  END IF;

  INSERT INTO bookings (user_id, event_id, total_amount, status)
  VALUES (p_user_id, p_event_id, p_total_amount, 'Confirmed')
  RETURNING id INTO v_booking_id;

  FOR v_seat_id IN
    SELECT s.id FROM unnest(p_seat_ids) AS s(id) ORDER BY s.id
  LOOP
    SELECT * INTO v_seat FROM seating_chart WHERE id = v_seat_id FOR UPDATE;

    INSERT INTO tickets (booking_id, seat_id, price, ticket_type)
    VALUES (
      v_booking_id,
      v_seat_id,
      COALESCE(v_seat.price, 0),
      COALESCE(v_seat.seat_type, 'Standard')
    );

    UPDATE seating_chart
    SET status = 'sold', user_id = p_user_id, locked_at = NULL
    WHERE id = v_seat_id;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'message', 'Đặt vé thành công'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'BOOKING_FAILED',
      'message', SQLERRM
    );
END;
$$;

GRANT EXECUTE ON FUNCTION expire_stale_seat_locks(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION hold_seat(UUID, UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION release_seat(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION release_seats(UUID[], UUID) TO service_role;
GRANT EXECUTE ON FUNCTION confirm_booking(UUID, UUID, UUID, UUID[], NUMERIC) TO service_role;

-- Thêm cột QR code vào bảng tickets
-- Chạy migration này sau 003_seat_lifecycle_checkout.sql

-- Drop các hàm cũ nếu tồn tại (để cập nhật signature)
DROP FUNCTION IF EXISTS get_user_bookings(BIGINT) CASCADE;
DROP FUNCTION IF EXISTS get_booking_with_showtime(BIGINT, BIGINT) CASCADE;

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS qr_code TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS qr_generated_at TIMESTAMPTZ DEFAULT NULL;

-- Tạo hàm sinh QR code cho từng vé
CREATE OR REPLACE FUNCTION generate_ticket_qr(
  p_ticket_id BIGINT,
  p_booking_id BIGINT,
  p_user_id BIGINT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ticket_code TEXT;
  v_qr_data JSONB;
BEGIN
  IF p_ticket_id IS NULL OR p_booking_id IS NULL OR p_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Thiếu tham số');
  END IF;

  -- Sinh mã QR theo format: BOOKING_ID-TICKET_ID-USER_ID-TIMESTAMP
  v_ticket_code := CONCAT(
    p_booking_id, '-',
    p_ticket_id, '-',
    p_user_id, '-',
    TO_CHAR(NOW(), 'YYYYMMDDHHmmss')
  );

  -- Cập nhật QR code và thời gian sinh
  UPDATE tickets
  SET qr_code = v_ticket_code,
      qr_generated_at = NOW()
  WHERE id = p_ticket_id;

  v_qr_data := jsonb_build_object(
    'success', true,
    'ticket_id', p_ticket_id,
    'qr_code', v_ticket_code,
    'generated_at', NOW()
  );

  RETURN v_qr_data;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- Hàm lấy booking details với tickets và QR codes
CREATE OR REPLACE FUNCTION get_user_bookings(p_user_id BIGINT)
RETURNS TABLE(
  booking_id BIGINT,
  event_id BIGINT,
  total_amount NUMERIC,
  status TEXT,
  tickets JSONB,
  event_data JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.event_id,
    b.total_amount,
    b.status,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', t.id,
          'booking_id', t.booking_id,
          'seat_id', t.seat_id,
          'price', t.price,
          'ticket_type', t.ticket_type,
          'qr_code', t.qr_code,
          'qr_generated_at', t.qr_generated_at,
          'seat_info', jsonb_build_object(
            'row', sc.row,
            'column', sc.seat_number,
            'section', sc.section
          )
        ) ORDER BY t.id
      ),
      '[]'::jsonb
    ) as tickets,
    COALESCE(
      jsonb_build_object(
        'id', e.id,
        'title', e.title,
        'description', e.description,
        'venue', e.venue,
        'image_url', e.image_url
      ),
      '{}'::jsonb
    ) as event_data
  FROM bookings b
  LEFT JOIN tickets t ON b.id = t.booking_id
  LEFT JOIN seating_chart sc ON t.seat_id = sc.id
  LEFT JOIN events e ON b.event_id = e.id
  WHERE b.user_id = p_user_id
  GROUP BY b.id, b.event_id, b.total_amount, b.status, e.id, e.title, e.description, e.venue, e.image_url
  ORDER BY b.id DESC;
END;
$$;

-- Hàm lấy showtime details cho booking
CREATE OR REPLACE FUNCTION get_booking_with_showtime(p_booking_id BIGINT, p_user_id BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'booking_id', b.id,
    'event_id', b.event_id,
    'total_amount', b.total_amount,
    'status', b.status,
    'event', jsonb_build_object(
      'id', e.id,
      'title', e.title,
      'description', e.description,
      'venue', e.venue,
      'image_url', e.image_url
    ),
    'showtime', (
      SELECT jsonb_build_object(
        'id', sh.id,
        'date', sh.date,
        'time', sh.time
      )
      FROM showtimes sh
      WHERE sh.event_id = b.event_id
      LIMIT 1
    ),
    'tickets', COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', t.id,
          'booking_id', t.booking_id,
          'seat_id', t.seat_id,
          'price', t.price,
          'ticket_type', t.ticket_type,
          'qr_code', t.qr_code,
          'qr_generated_at', t.qr_generated_at,
          'seat_info', jsonb_build_object(
            'row', sc.row,
            'column', sc.seat_number,
            'section', sc.section,
            'floor', sc.floor
          )
        ) ORDER BY t.id
      ),
      '[]'::jsonb
    )
  ) INTO v_result
  FROM bookings b
  LEFT JOIN tickets t ON b.id = t.booking_id
  LEFT JOIN seating_chart sc ON t.seat_id = sc.id
  LEFT JOIN events e ON b.event_id = e.id
  WHERE b.id = p_booking_id AND b.user_id = p_user_id
  GROUP BY b.id, b.event_id, b.total_amount, b.status, e.id, e.title, e.description, e.venue, e.image_url;

  IF v_result IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Không tìm thấy đơn hàng');
  END IF;

  RETURN jsonb_set(v_result, '{success}', 'true'::jsonb);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION generate_ticket_qr(BIGINT, BIGINT, BIGINT) TO service_role;
GRANT EXECUTE ON FUNCTION get_user_bookings(BIGINT) TO service_role;
GRANT EXECUTE ON FUNCTION get_booking_with_showtime(BIGINT, BIGINT) TO service_role;

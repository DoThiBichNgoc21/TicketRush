import supabase from '../config/supabase.js'

const toBigIntId = (value, fieldName) => {
  const n = Number(value)
  if (!Number.isFinite(n) || n < 1) {
    throw new Error(`${fieldName} không hợp lệ`)
  }
  return Math.trunc(n)
}

/**
 * GET /api/tickets/my-bookings
 * Lấy danh sách tất cả đơn hàng và vé của user
 */
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id

    const { data, error } = await supabase.rpc('get_user_bookings', {
      p_user_id: toBigIntId(userId, 'user_id'),
    })

    if (error) {
      console.error('[getMyBookings] RPC error:', error)
      return res.status(500).json({
        success: false,
        code: 'RPC_ERROR',
        message: error.message,
      })
    }

    return res.status(200).json({
      success: true,
      bookings: data || [],
    })
  } catch (err) {
    console.error('[getMyBookings]', err.message)
    return res.status(500).json({
      success: false,
      message: err.message,
    })
  }
}

/**
 * GET /api/tickets/booking/:bookingId
 * Lấy chi tiết một đơn hàng cùng tickets và QR codes
 */
export const getBookingDetails = async (req, res) => {
  try {
    const userId = req.user.id
    const { bookingId } = req.params

    const { data, error } = await supabase.rpc('get_booking_with_showtime', {
      p_booking_id: toBigIntId(bookingId, 'booking_id'),
      p_user_id: toBigIntId(userId, 'user_id'),
    })

    if (error) {
      console.error('[getBookingDetails] RPC error:', error)
      return res.status(500).json({
        success: false,
        code: 'RPC_ERROR',
        message: error.message,
      })
    }

    if (!data?.success) {
      return res.status(404).json({
        success: false,
        message: data?.message || 'Không tìm thấy đơn hàng',
      })
    }

    return res.status(200).json(data)
  } catch (err) {
    console.error('[getBookingDetails]', err.message)
    return res.status(500).json({
      success: false,
      message: err.message,
    })
  }
}

/**
 * POST /api/tickets/:ticketId/generate-qr
 * Tạo QR code cho một vé (nếu chưa tạo)
 */
export const generateTicketQR = async (req, res) => {
  try {
    const userId = req.user.id
    const { ticketId } = req.params

    // Trước tiên kiểm tra vé thuộc user này không
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        id,
        booking_id,
        qr_code,
        bookings!inner(user_id)
      `)
      .eq('id', toBigIntId(ticketId, 'ticket_id'))
      .single()

    if (ticketError || !ticket) {
      return res.status(404).json({
        success: false,
        message: 'Vé không tồn tại',
      })
    }

    if (ticket.bookings[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập vé này',
      })
    }

    // Nếu đã có QR code thì trả về luôn
    if (ticket.qr_code) {
      return res.status(200).json({
        success: true,
        ticket_id: ticket.id,
        qr_code: ticket.qr_code,
        message: 'QR code đã tồn tại',
      })
    }

    // Sinh QR code mới
    const { data, error } = await supabase.rpc('generate_ticket_qr', {
      p_ticket_id: toBigIntId(ticketId, 'ticket_id'),
      p_booking_id: toBigIntId(ticket.booking_id, 'booking_id'),
      p_user_id: toBigIntId(userId, 'user_id'),
    })

    if (error) {
      console.error('[generateTicketQR] RPC error:', error)
      return res.status(500).json({
        success: false,
        code: 'RPC_ERROR',
        message: error.message,
      })
    }

    if (!data.success) {
      return res.status(400).json(data)
    }

    return res.status(200).json(data)
  } catch (err) {
    console.error('[generateTicketQR]', err.message)
    return res.status(500).json({
      success: false,
      message: err.message,
    })
  }
}

/**
 * POST /api/tickets/:ticketId/verify
 * Xác minh QR code (dùng cho check-in)
 */
export const verifyTicket = async (req, res) => {
  try {
    const { ticketId } = req.params
    const { qr_code } = req.body

    if (!qr_code) {
      return res.status(400).json({
        success: false,
        message: 'QR code không được để trống',
      })
    }

    // Lấy vé từ DB
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('id, qr_code, booking_id, bookings(id, user_id, status)')
      .eq('id', toBigIntId(ticketId, 'ticket_id'))
      .single()

    if (error || !ticket) {
      return res.status(404).json({
        success: false,
        message: 'Vé không tồn tại',
      })
    }

    // Kiểm tra QR code
    const isValid = ticket.qr_code === qr_code
    const isConfirmed = ticket.bookings[0]?.status === 'Confirmed'

    return res.status(isValid ? 200 : 400).json({
      success: isValid && isConfirmed,
      ticket_id: ticket.id,
      booking_id: ticket.booking_id,
      is_valid: isValid,
      is_confirmed: isConfirmed,
      message: isValid
        ? isConfirmed
          ? 'QR code hợp lệ'
          : 'QR code hợp lệ nhưng vé chưa được xác nhận'
        : 'QR code không hợp lệ',
    })
  } catch (err) {
    console.error('[verifyTicket]', err.message)
    return res.status(500).json({
      success: false,
      message: err.message,
    })
  }
}

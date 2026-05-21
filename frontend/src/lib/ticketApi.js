import bookingAxios from './bookingAxios'

/**
 * Lấy danh sách tất cả đơn hàng và vé của user
 */
export async function getMyBookings() {
  const { data } = await bookingAxios.get('/tickets/my-bookings')
  return data
}

/**
 * Lấy chi tiết một đơn hàng cùng tickets và QR codes
 */
export async function getBookingDetails(bookingId) {
  const { data } = await bookingAxios.get(`/tickets/booking/${bookingId}`)
  return data
}

/**
 * Sinh QR code cho một vé
 */
export async function generateTicketQR(ticketId) {
  const { data } = await bookingAxios.post(`/tickets/${ticketId}/generate-qr`)
  return data
}

/**
 * Xác minh QR code (kiểm tra tính hợp lệ)
 */
export async function verifyTicket(ticketId, qrCode) {
  const { data } = await bookingAxios.post(`/tickets/${ticketId}/verify`, {
    qr_code: qrCode,
  })
  return data
}

import { Router } from 'express'
import { verifyToken, requireUser } from '../middleware/authMiddleware.js'
import {
  getMyBookings,
  getBookingDetails,
  generateTicketQR,
  verifyTicket,
} from '../Controllers/ticketController.js'

const router = Router()

// Tất cả routes cần xác thực user
router.use(verifyToken, requireUser)

// Lấy danh sách đơn hàng và vé của user
router.get('/my-bookings', getMyBookings)

// Lấy chi tiết một đơn hàng
router.get('/booking/:bookingId', getBookingDetails)

// Sinh QR code cho một vé
router.post('/:ticketId/generate-qr', generateTicketQR)

// Xác minh QR code (check-in)
router.post('/:ticketId/verify', verifyTicket)

export default router

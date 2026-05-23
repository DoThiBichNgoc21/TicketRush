import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Header } from '../../components/header'
import { Footer } from '../../components/footer'
import { Button } from '../../components/ui/button'
import { Separator } from '../../components/ui/separator'
import { Card } from '../../components/ui/card'
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  QrCode,
  Download,
  ArrowLeft,
} from 'lucide-react'
import { toast } from 'sonner'
import QRCode from 'qrcode'
import { getMyBookings, generateTicketQR } from '../../lib/ticketApi'
import { getUserToken } from '../../lib/bookingAxios'

export default function MyTickets() {
  const navigate = useNavigate()
  const location = useLocation()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedBooking, setExpandedBooking] = useState(null)
  const [qrDisplays, setQrDisplays] = useState({}) // { ticketId: base64 }
  const [generatingQR, setGeneratingQR] = useState({})

  useEffect(() => {
    if (!getUserToken()) {
      toast.error('Vui lòng đăng nhập để xem vé')
      navigate('/login')
      return
    }

    loadBookings()
  }, [navigate])

  // Tự động mở rộng đơn hàng nếu đi từ trang thanh toán thành công
  useEffect(() => {
    if (location.state?.expandBookingId) {
      setExpandedBooking(location.state.expandBookingId)
    }
  }, [location.state])

  // Tự động generate QR code khi bookings được load
  useEffect(() => {
    if (bookings.length === 0) return
    
    bookings.forEach((booking) => {
      booking.tickets?.forEach((ticket) => {
        if (ticket.qr_code && !qrDisplays[ticket.id]) {
          handleGenerateQR(ticket)
        }
      })
    })
  }, [bookings.length])

  const loadBookings = async () => {
    setLoading(true)
    try {
      const result = await getMyBookings()
      console.log('[MyTickets] API response:', result)
      if (result?.success) {
        // Lọc chỉ hiển thị vé đã xác nhận (status = 'Confirmed')
        const confirmedBookings = (result.bookings || []).filter(
          (booking) => booking.status === 'Confirmed'
        )
        console.log('[MyTickets] Confirmed bookings:', confirmedBookings)
        setBookings(confirmedBookings)
      } else {
        toast.error(result?.message || 'Không thể tải danh sách vé')
      }
    } catch (err) {
      toast.error(err?.message || 'Lỗi khi tải vé')
      console.error('[loadBookings]', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateQR = async (ticket) => {
    if (!ticket.id) return
    setGeneratingQR((prev) => ({ ...prev, [ticket.id]: true }))
    try {
      // Nếu QR code đã tồn tại, dùng luôn
      const qrData = ticket.qr_code

      if (!qrData) {
        toast.error('Không thể tạo QR code')
        return
      }

      // Tạo hình ảnh QR code từ dữ liệu
      const qrCanvas = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 1,
        width: 300,
      })

      setQrDisplays((prev) => ({
        ...prev,
        [ticket.id]: qrCanvas,
      }))
    } catch (err) {
      toast.error('Lỗi khi tạo QR code')
      console.error('[handleGenerateQR]', err)
    } finally {
      setGeneratingQR((prev) => ({ ...prev, [ticket.id]: false }))
    }
  }

  const handleDownloadQR = (ticket) => {
    const qrImage = qrDisplays[ticket.id]
    if (!qrImage) {
      toast.error('Vui lòng tạo QR code trước')
      return
    }

    const link = document.createElement('a')
    link.href = qrImage
    link.download = `ticket-${ticket.id}-${ticket.booking_id}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('QR code đã được tải xuống')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          <h1 className="text-3xl font-bold text-foreground">Vé của tôi</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý và xem QR code cho các vé đã đặt
          </p>
        </div>

        {bookings.length === 0 ? (
          <Card className="p-12 text-center">
            <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Bạn chưa đặt vé nào</p>
            <Button onClick={() => navigate('/')} className="w-full sm:w-auto">
              Khám phá sự kiện
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Thanh thông báo nếu đang lọc xem 1 vé vừa đặt */}
            {location.state?.expandBookingId && expandedBooking && (
              <div className="flex items-center justify-between bg-primary/10 border border-primary/20 p-4 rounded-xl mb-6">
                <p className="text-sm font-medium text-primary">
                  Đang hiển thị vé bạn vừa đặt.
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:bg-primary/20 font-bold"
                  onClick={() => {
                    setExpandedBooking(null)
                    // Xóa state để hiện lại tất cả
                    navigate(location.pathname, { replace: true, state: {} })
                  }}
                >
                  Xem tất cả vé của tôi
                </Button>
              </div>
            )}

            {bookings
              .filter(b => !location.state?.expandBookingId || b.booking_id === location.state.expandBookingId)
              .map((booking) => (
              <Card
                key={booking.booking_id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Booking Header */}
                <button
                  onClick={() =>
                    setExpandedBooking(
                      expandedBooking === booking.booking_id
                        ? null
                        : booking.booking_id
                    )
                  }
                  className="w-full p-6 text-left hover:bg-muted/50 transition flex items-start justify-between gap-4"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">
                      {booking.event_data?.name || 'Sự kiện'}
                    </h3>
                    <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                      {booking.event_data?.venue && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {booking.event_data.venue}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4" />
                        {booking.tickets?.length || 0} vé — Mã:{' '}
                        {booking.booking_id}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {booking.total_amount?.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedBooking === booking.booking_id && (
                  <>
                    <Separator />
                    <div className="p-6 bg-muted/30 space-y-6">
                      {/* Tickets */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Ticket className="w-4 h-4" />
                          Chi tiết vé
                        </h4>
                        <div className="space-y-3">
                          {booking.tickets?.map((ticket) => (
                            <div
                              key={ticket.id}
                              className="bg-card border border-border rounded-lg p-4 space-y-3"
                            >
                              {/* Seat Info */}
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-semibold text-foreground">
                                    Ghế {ticket.seat_info?.row}
                                    {ticket.seat_info?.column}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {ticket.seat_info?.section || 'Chưa xác định'}{' '}
                                    {ticket.seat_info?.floor &&
                                      `- Tầng ${ticket.seat_info.floor}`}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-primary">
                                    {ticket.price?.toLocaleString('vi-VN')}đ
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {ticket.ticket_type || 'Standard'}
                                  </p>
                                </div>
                              </div>

                              {/* QR Code Section */}
                              {ticket.qr_code && (
                                <>
                                  <Separator />
                                  <div className="flex flex-col items-center gap-3">
                                    {qrDisplays[ticket.id] ? (
                                      <>
                                        <img
                                          src={qrDisplays[ticket.id]}
                                          alt="QR Code"
                                          className="w-48 h-48 border border-border rounded-lg p-2 bg-white"
                                        />
                                        <div className="flex gap-2">
                                          <Button
                                            variant="default"
                                            size="sm"
                                            onClick={() => handleDownloadQR(ticket)}
                                            className="gap-2"
                                          >
                                            <Download className="w-4 h-4" />
                                            Tải xuống
                                          </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground text-center">
                                          Mã: {ticket.qr_code}
                                        </p>
                                      </>
                                    ) : (
                                      <div className="text-xs text-muted-foreground">
                                        Đang tạo QR code...
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

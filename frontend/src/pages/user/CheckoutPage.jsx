import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '../../components/header'
import { Footer } from '../../components/footer'
import { Button } from '../../components/ui/button'
import { Separator } from '../../components/ui/separator'
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react'
import { toast } from 'sonner'
import { confirmBooking, getUserToken } from '../../lib/seatHoldApi'
import { clearCheckoutDraft, loadCheckoutDraft } from '../../lib/checkoutSession'

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function CheckoutPage() {
  const { showtimeId } = useParams()
  const navigate = useNavigate()
  const [draft, setDraft] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isPaying, setIsPaying] = useState(false)
  const [orderResult, setOrderResult] = useState(null)

  useEffect(() => {
    if (!getUserToken()) {
      toast.error('Vui lòng đăng nhập để thanh toán')
      navigate('/login')
      return
    }

    const data = loadCheckoutDraft(showtimeId)
    if (!data?.seats?.length) {
      toast.error('Không có ghế trong giỏ. Vui lòng chọn ghế lại.')
      navigate(`/booking/${showtimeId}`)
      return
    }
    setDraft(data)
  }, [showtimeId, navigate])

  useEffect(() => {
    if (!draft?.sessionExpiresAt || orderResult) return

    const tick = () => {
      const left = Math.max(
        0,
        Math.floor((draft.sessionExpiresAt - Date.now()) / 1000)
      )
      setTimeLeft(left)
      if (left <= 0) {
        clearCheckoutDraft(showtimeId)
        toast.error('Hết thời gian thanh toán. Ghế đã được nhả lại.')
        navigate(`/booking/${showtimeId}`)
      }
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [draft, orderResult, showtimeId, navigate])

  const totalAmount = draft?.seats?.reduce((s, x) => s + x.price, 0) ?? 0

  const handleConfirmPay = async () => {
    if (!draft || isPaying) return
    setIsPaying(true)
    try {
      const result = await confirmBooking({
        eventId: draft.eventId,
        showtimeId: draft.showtimeId,
        seatIds: draft.seats.map((s) => s.id),
        totalAmount,
      })

      if (!result?.success) {
        toast.error(result?.message || 'Không thể hoàn tất thanh toán')
        navigate(`/booking/${showtimeId}`)
        return
      }

      clearCheckoutDraft(showtimeId)
      setOrderResult({
        bookingId: result.booking_id,
        seats: draft.seats,
        event: draft.event,
        showtime: draft.showtime,
        totalAmount,
      })
      toast.success('Thanh toán thành công!')
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || 'Thanh toán thất bại'
      )
    } finally {
      setIsPaying(false)
    }
  }

  if (!draft && !orderResult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (orderResult) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-24 max-w-lg">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg text-center space-y-6">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h1 className="text-2xl font-black text-foreground">
                Đặt vé thành công
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Mã đơn: #{orderResult.bookingId}
              </p>
            </div>
            <div className="text-left space-y-2 rounded-xl bg-muted/50 p-4">
              <p className="font-bold">{orderResult.event?.title}</p>
              <p className="text-sm text-muted-foreground">
                {orderResult.showtime?.date} — {orderResult.showtime?.time}
              </p>
              <Separator />
              {orderResult.seats.map((s) => (
                <div key={s.id} className="flex justify-between text-sm">
                  <span>
                    Ghế {s.row}
                    {s.column}
                  </span>
                  <span className="font-semibold">
                    {s.price.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold text-primary">
                <span>Tổng</span>
                <span>{orderResult.totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
            <Button
              className="w-full h-12 font-bold"
              onClick={() => navigate('/my-tickets')}
            >
              Xem vé của tôi
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 font-bold"
              onClick={() => navigate(`/booking/${showtimeId}`)}
            >
              Về trang sự kiện
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const isWarning = timeLeft <= 120

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-24 max-w-2xl">
        <button
          type="button"
          onClick={() => navigate(`/booking/${showtimeId}`)}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại chọn ghế
        </button>

        <h1 className="text-2xl font-black mb-2">Thanh toán</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Xác nhận đơn hàng (mô phỏng — không qua cổng thanh toán thật)
        </p>

        <div
          className={`mb-6 flex items-center justify-between rounded-lg p-4 ${
            isWarning
              ? 'bg-destructive/10 text-destructive'
              : 'bg-primary/10 text-primary'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm font-medium">
              Thời gian còn lại để thanh toán
            </span>
          </div>
          <span className="font-mono text-xl font-bold">
            {formatTime(timeLeft)}
          </span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="space-y-2 text-sm">
            <p className="text-lg font-bold">{draft.event?.title}</p>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {draft.showtime?.date}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {draft.showtime?.time}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {draft.event?.venue}
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-2 font-semibold">
            <Ticket className="h-4 w-4 text-primary" />
            Chi tiết ghế ({draft.seats.length})
          </div>

          <ul className="space-y-2">
            {draft.seats.map((seat) => (
              <li
                key={seat.id}
                className="flex justify-between items-center rounded-lg border border-border p-3 text-sm"
              >
                <span className="font-medium">
                  Ghế {seat.row}
                  {seat.column} —{' '}
                  {String(seat.type || '').toUpperCase() === 'VIP'
                    ? 'VIP'
                    : 'Thường'}
                </span>
                <span className="font-bold text-primary">
                  {seat.price.toLocaleString('vi-VN')}đ
                </span>
              </li>
            ))}
          </ul>

          <Separator />

          <div className="flex justify-between items-center">
            <span className="font-bold text-lg">Tổng thanh toán</span>
            <span className="text-2xl font-black text-primary">
              {totalAmount.toLocaleString('vi-VN')}đ
            </span>
          </div>

          <Button
            className="w-full h-14 text-lg font-black tracking-wide"
            disabled={isPaying || timeLeft <= 0}
            onClick={handleConfirmPay}
          >
            {isPaying ? 'Đang xử lý...' : 'XÁC NHẬN'}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Trạng thái ghế: <strong>Locked</strong> → sau khi xác nhận →{' '}
            <strong>Sold</strong>. Hết 10 phút → <strong>Released</strong> (Available).
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

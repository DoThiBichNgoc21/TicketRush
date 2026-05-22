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
import { confirmBooking, getUserToken, validateDiscount, getAvailableDiscounts } from '../../lib/seatHoldApi'
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
  const [discountCode, setDiscountCode] = useState('')
  const [discountData, setDiscountData] = useState(null)
  const [isValidating, setIsValidating] = useState(false)
  const [availableVouchers, setAvailableVouchers] = useState([])

  const originalAmount = draft?.seats?.reduce((s, x) => s + x.price, 0) ?? 0
  const discountAmount = discountData?.discount_amount ?? 0
  const totalAmount = originalAmount - discountAmount

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

  useEffect(() => {
    if (!draft?.eventId) return
    const fetchVouchers = async () => {
      try {
        const res = await getAvailableDiscounts(draft.eventId)
        if (res.success) {
          setAvailableVouchers(res.data)
          
          // Kiểm tra xem mã đang áp dụng có còn hiệu lực không
          setDiscountData(current => {
            if (current && !res.data.find(v => v.code === current.code)) {
              toast.info(`Mã ${current.code} đã hết lượt hoặc không còn hiệu lực.`)
              setDiscountCode('')
              return null
            }
            return current
          })
        }
      } catch (err) {
        console.error('Lỗi khi lấy mã giảm giá:', err)
      }
    }
    
    // Tải ngay lần đầu
    fetchVouchers()

    // Tự động quét lại kho mã mỗi 10 giây để xóa mã đã hết lượt (tránh lỗi stale data)
    const interval = setInterval(fetchVouchers, 10000)
    
    return () => clearInterval(interval)
  }, [draft?.eventId])

  const handleApplyDiscount = async (codeToApply) => {
    const code = codeToApply || discountCode
    if (!code.trim()) return
    setIsValidating(true)
    try {
      const res = await validateDiscount({
        code: code,
        eventId: draft.eventId,
        totalPrice: originalAmount,
        quantity: draft.seats.length
      })
      if (res.success) {
        setDiscountData(res.data)
        setDiscountCode(code)
        toast.success(res.data.message)
      } else {
        toast.error(res.message || 'Mã giảm giá không hợp lệ')
        
        // Nếu mã đã hết lượt, tự động cập nhật lại danh sách gợi ý để mã đó biến mất
        if (res.code === 'LIMIT_REACHED') {
            const resVal = await getAvailableDiscounts(draft.eventId)
            if (resVal.success) setAvailableVouchers(resVal.data)
        }
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Lỗi khi áp dụng mã giảm giá'
      const errCode = err.response?.data?.code
      toast.error(errMsg)

      if (errCode === 'LIMIT_REACHED') {
          const resVal = await getAvailableDiscounts(draft.eventId)
          if (resVal.success) setAvailableVouchers(resVal.data)
      }
    } finally {
      setIsValidating(false)
    }
  }

  const handleRemoveDiscount = async () => {
    setDiscountData(null)
    setDiscountCode('')
    
    // Tự động làm mới danh sách voucher
    try {
      const res = await getAvailableDiscounts(draft.eventId)
      if (res.success) setAvailableVouchers(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleConfirmPay = async () => {
    if (!draft || isPaying) return
    setIsPaying(true)
    try {
      const result = await confirmBooking({
        eventId: draft.eventId,
        showtimeId: draft.showtimeId,
        seatIds: draft.seats.map((s) => s.id),
        totalAmount,
        discountId: discountData?.id,
        discountAmount: discountData?.discount_amount,
        paymentMethod: 'Thẻ nội địa'
      })

      if (!result?.success) {
        toast.error(result?.message || 'Không thể hoàn tất thanh toán')
        
        // Nếu lỗi liên quan đến mã giảm giá (hết lượt hoặc sai giá)
        const discountErrors = ['PRICE_MISMATCH', 'LIMIT_REACHED', 'DISCOUNT_INACTIVE', 'DISCOUNT_LIMIT_REACHED']
        if (discountErrors.includes(result.code)) {
            // Tự động xóa mã đã chọn để người dùng tính toán lại theo giá gốc
            setDiscountData(null)
            setDiscountCode('')
            
            // Cập nhật lại danh sách mã khả dụng
            const resVal = await getAvailableDiscounts(draft.eventId)
            if (resVal.success) setAvailableVouchers(resVal.data)
        }
        return
      }

      clearCheckoutDraft(showtimeId)
      setOrderResult({
        bookingId: result.booking_id,
        seats: draft.seats,
        event: draft.event,
        showtime: draft.showtime,
        totalAmount,
        discountAmount,
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
              {orderResult.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Giảm giá</span>
                  <span>-{orderResult.discountAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-primary">
                <span>Tổng cộng</span>
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

          <ul className="space-y-4">
            {draft.seats.map((seat) => (
              <li
                key={seat.id}
                className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md"
              >
                {/* Dải màu bên trái phân loại vé */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  String(seat.type || '').toUpperCase() === 'VIP' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                
                <div className="p-4 pl-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-black tracking-tight text-foreground">
                        Hàng {seat.row} — Ghế {seat.column}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          String(seat.type || '').toUpperCase() === 'VIP' 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-blue-100 text-blue-700'
                        }`}>
                          {String(seat.type || '').toUpperCase() === 'VIP' ? 'PREMIUM VIP' : 'STANDARD TICKET'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-primary">
                        {seat.price.toLocaleString('vi-VN')}đ
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
                        Chưa áp mã
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 py-3 border-t border-dashed border-border/60">
                    {seat.section && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground uppercase font-bold">Khu vực</p>
                          <p className="text-xs font-bold text-foreground">{seat.section}</p>
                        </div>
                      </div>
                    )}
                    {seat.floor && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                          <Ticket className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground uppercase font-bold">Tầng</p>
                          <p className="text-xs font-bold text-foreground">{seat.floor}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <Separator />

          {/* New Premium Voucher List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-black uppercase tracking-wider text-muted-foreground">Mã giảm giá</label>
              {discountData && (
                <button onClick={handleRemoveDiscount} className="text-xs text-red-500 font-bold hover:underline">Gỡ mã</button>
              )}
            </div>

            {!discountData && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập mã ưu đãi..."
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  disabled={isValidating}
                  className="flex-1 bg-muted/30 border-2 border-transparent rounded-xl py-3 px-4 text-sm font-bold focus:border-primary/20 focus:bg-background outline-none transition-all placeholder:font-medium"
                />
                <Button 
                  className="rounded-xl px-8 h-12 font-black shadow-lg shadow-primary/20" 
                  onClick={() => handleApplyDiscount()}
                  disabled={!discountCode || isValidating}
                >
                  {isValidating ? '...' : 'ÁP DỤNG'}
                </Button>
              </div>
            )}

            {!discountData && availableVouchers.length > 0 && (
              <div className="space-y-3 pt-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Kho voucher của bạn</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableVouchers.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleApplyDiscount(v.code)}
                      className="group relative flex items-center bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-md transition-all text-left h-[80px]"
                    >
                      {/* Left side with icon */}
                      <div className="w-16 h-full bg-primary/5 flex items-center justify-center relative">
                        {/* Notch top */}
                        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-background rounded-full" />
                        {/* Notch bottom */}
                        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-background rounded-full" />
                        {/* Vertical Dashed Line */}
                        <div className="absolute right-0 top-3 bottom-3 border-r border-dashed border-border" />
                        
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                           <Ticket className="w-4 h-4" />
                        </div>
                      </div>
                      
                      {/* Voucher content */}
                      <div className="flex-1 px-4 py-2 flex flex-col justify-center">
                        <p className="text-[14px] font-black text-foreground group-hover:text-primary transition-colors">{v.code}</p>
                        <p className="text-[11px] font-bold text-primary mt-1 line-clamp-2">
                          {(() => {
                            if (v.discount_type === 'percentage') return `Giảm ${v.discount_value}%`
                            if (v.discount_type === 'fixed') return `Giảm ${v.discount_value.toLocaleString('vi-VN')} VNĐ`
                            if (v.discount_type === 'tiered' && v.tiers?.length > 0) {
                              const firstTier = v.tiers.sort((a, b) => a.min_quantity - b.min_quantity)[0]
                              const maxTier = v.tiers.sort((a, b) => b.discount_value - a.discount_value)[0]
                              return `Giảm tới ${maxTier.discount_value}% (từ ${firstTier.min_quantity} vé)`
                            }
                            return 'Ưu đãi đặt chỗ'
                          })()}
                        </p>
                        {v.expires_at && (
                          <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground font-medium">
                            <Clock className="w-2.5 h-2.5" />
                            Hết hạn: {new Date(v.expires_at).toLocaleDateString('vi-VN')}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {discountData && (
              <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-green-700">Đã áp dụng: {discountData.code}</p>
                    <p className="text-[10px] font-medium text-green-600 mt-0.5">Tiết kiệm được {discountData.discount_amount.toLocaleString('vi-VN')}đ</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tạm tính</span>
              <span>{originalAmount.toLocaleString('vi-VN')}đ</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Giảm giá</span>
                <span>-{discountAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2">
              <span className="font-bold text-lg">Tổng thanh toán</span>
              <span className="text-2xl font-black text-primary">
                {totalAmount.toLocaleString('vi-VN')}đ
              </span>
            </div>
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

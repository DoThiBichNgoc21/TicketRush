import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Header } from '../../components/header'
import { Footer } from '../../components/footer'
import { supabase } from '../../lib/supabaseClient'
import { Calendar, MapPin, Clock, Tag, Share2, Ticket, ChevronLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { SeatMap } from '../../components/seat-selection/seat-map'
import { toast } from 'sonner'

const EventDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [showtimes, setShowtimes] = useState([])
  const [selectedShowtime, setSelectedShowtime] = useState(null)
  const [seats, setSeats] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])
  const [prices, setPrices] = useState({ min: 0, max: 0 })
  const [loading, setLoading] = useState(true)
  const [fetchingSeats, setFetchingSeats] = useState(false)

  useEffect(() => {
    async function fetchEventDetails() {
      setLoading(true)
      try {
        // Fetch event basic info
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single()

        if (eventError) throw eventError
        setEvent(eventData)

        // Fetch showtimes for this event
        const { data: showtimeData, error: showtimeError } = await supabase
          .from('showtimes')
          .select('*')
          .eq('event_id', id)
          .order('start_time', { ascending: true })

        if (!showtimeError && showtimeData) {
          setShowtimes(showtimeData)
          // Tự động chọn lịch diễn đầu tiên nếu có
          if (showtimeData.length > 0) {
            setSelectedShowtime(showtimeData[0])
          }
        }
      } catch (error) {
        console.error('Error fetching event details:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchEventDetails()
  }, [id])

  // Fetch seats when showtime changes
  useEffect(() => {
    async function fetchSeats() {
      if (!selectedShowtime) return
      setFetchingSeats(true)
      try {
        const { data: seatData, error: seatError } = await supabase
          .from('seating_chart')
          .select('*')
          .eq('showtime_id', selectedShowtime.id)

        if (seatError) throw seatError

        const mappedSeats = seatData.map(s => ({
          id: s.id,
          row: s.row,
          column: parseInt(s.seat_number),
          status: s.status,
          type: s.seat_type,
          price: s.price || (s.seat_type === 'VIP' ? s.vip_price : s.standard_price) || 0,
          section: s.section
        }))
        setSeats(mappedSeats)

        // Update price range
        if (mappedSeats.length > 0) {
          const allPrices = mappedSeats.map(s => s.price).filter(p => p > 0)
          setPrices({
            min: Math.min(...allPrices),
            max: Math.max(...allPrices)
          })
        }
      } catch (error) {
        console.error('Error fetching seats:', error)
      } finally {
        setFetchingSeats(false)
      }
    }

    fetchSeats()
  }, [selectedShowtime])

  const handleSeatClick = (seat) => {
    if (selectedSeats.some(s => s.id === seat.id)) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id))
    } else {
      if (selectedSeats.length >= 8) {
        toast.warning('Bạn chỉ có thể chọn tối đa 8 ghế')
        return
      }
      setSelectedSeats([...selectedSeats, seat])
    }
  }

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      toast.error('Vui lòng chọn ít nhất một chỗ ngồi')
      return
    }

    const userRaw = localStorage.getItem('user_info')
    if (!userRaw) {
      toast.error('Vui lòng đăng nhập để đặt vé')
      navigate('/login')
      return
    }

    const user = JSON.parse(userRaw)
    const totalAmount = selectedSeats.reduce((sum, s) => sum + s.price, 0)

    try {
      // 1. Create Booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          event_id: event.id,
          total_amount: totalAmount,
          status: 'Confirmed'
        })
        .select()
        .single()

      if (bookingError) throw bookingError

      // 2. Create Tickets and Update Seats
      for (const seat of selectedSeats) {
        await supabase.from('tickets').insert({
          booking_id: booking.id,
          seat_id: seat.id,
          price: seat.price,
          ticket_type: seat.type
        })

        await supabase.from('seating_chart')
          .update({ status: 'sold', user_id: user.id })
          .eq('id', seat.id)
      }

      toast.success('Đặt vé thành công!')
      navigate('/my-tickets')
    } catch (error) {
      console.error('Booking error:', error)
      toast.error('Có lỗi xảy ra khi đặt vé')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <h2 className="text-2xl font-bold">Không tìm thấy sự kiện</h2>
          <Button onClick={() => navigate('/su-kien')}>Quay lại danh sách</Button>
        </div>
        <Footer />
      </div>
    )
  }

  const eventDate = new Date(event.date)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-20">
        {/* Breadcrumb / Back button */}
        <div className="container mx-auto px-4 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Image and Description */}
            <div className="lg:col-span-2 space-y-8">
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-border shadow-lg">
                {event.image_url ? (
                  <img 
                    src={event.image_url} 
                    alt={event.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Tag className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-bold shadow-lg">
                    {event.category}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
                  {event.name}
                </h1>
                <div className="flex flex-wrap gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span>{eventDate.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>{eventDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              <div className="prose prose-slate dark:prose-invert max-w-none border-t border-border pt-8">
                <h3 className="text-xl font-bold mb-4">Thông tin sự kiện</h3>
                <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {event.description || "Chưa có mô tả chi tiết cho sự kiện này."}
                </div>
              </div>

              {/* Seat Selection Section */}
              <div className="border-t border-border pt-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-primary" />
                    Sơ đồ ghế ngồi
                  </h3>
                  {selectedShowtime && (
                    <div className="text-sm px-3 py-1 bg-secondary rounded-full font-medium">
                      Suất diễn: {new Date(selectedShowtime.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedShowtime.start_time).toLocaleDateString('vi-VN')}
                    </div>
                  )}
                </div>

                {fetchingSeats ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-inner">
                    <SeatMap 
                      seats={seats} 
                      selectedSeats={selectedSeats} 
                      onSeatClick={handleSeatClick} 
                      layout={event.layout_json}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-card rounded-2xl border border-border p-6 shadow-xl space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Địa điểm</p>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Giá từ</p>
                      <p className="text-2xl font-bold text-primary">
                        {prices.min > 0 
                          ? `${prices.min.toLocaleString('vi-VN')}đ` 
                          : "Liên hệ"}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>

                  {showtimes.length > 0 && (
                    <div className="mb-6 space-y-3">
                      <p className="text-sm font-semibold">Chọn lịch diễn</p>
                      <div className="grid grid-cols-1 gap-2">
                        {showtimes.map((st) => (
                          <button
                            key={st.id}
                            onClick={() => setSelectedShowtime(st)}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all text-left group ${
                              selectedShowtime?.id === st.id 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {new Date(st.start_time).toLocaleDateString('vi-VN')}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(st.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {selectedShowtime?.id === st.id ? (
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                            ) : (
                              <Ticket className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedSeats.length > 0 && (
                    <div className="mb-6 p-4 bg-secondary/50 rounded-xl space-y-2">
                      <p className="text-sm font-semibold">Ghế đã chọn ({selectedSeats.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedSeats.map(s => (
                          <span key={s.id} className="text-xs px-2 py-1 bg-background border border-border rounded font-bold">
                            {s.row}{s.column}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-border/50">
                        <span className="text-sm font-bold text-primary">
                          Tổng: {selectedSeats.reduce((sum, s) => sum + s.price, 0).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                  )}

                  <Button 
                    className="w-full py-6 text-lg font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
                    disabled={selectedSeats.length === 0}
                    onClick={handleBooking}
                  >
                    MUA VÉ NGAY
                  </Button>
                  
                  <p className="text-center text-xs text-muted-foreground mt-4">
                    Đảm bảo vé chính hãng 100%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default EventDetailPage

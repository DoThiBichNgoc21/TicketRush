import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Header } from '../../components/header'
import { Footer } from '../../components/footer'
import { SeatMap } from '../../components/seat-selection/seat-map'
import { BookingSidebar } from '../../components/seat-selection/booking-sidebar'
import { supabase } from '../../lib/supabaseClient'
import { toast } from 'sonner'

const BookingPage = () => {
  const { showtimeId } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [showtime, setShowtime] = useState(null)
  const [seats, setSeats] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // 1. Fetch showtime and linked event
        const { data: stData, error: stError } = await supabase
          .from('showtimes')
          .select('*, events(*)')
          .eq('id', showtimeId)
          .single()

        if (stError) throw stError
        setShowtime(stData)
        setEvent(stData.events)

        // 2. Fetch seating chart for this showtime
        const { data: seatData, error: seatError } = await supabase
          .from('seating_chart')
          .select('*')
          .eq('showtime_id', showtimeId)

        if (seatError) throw seatError
        
        // Map seating_chart to SeatMap format
        const mappedSeats = seatData.map(s => ({
          id: s.id,
          row: s.row,
          column: parseInt(s.seat_number),
          status: s.status, // 'available', 'locked', 'sold'
          type: s.seat_type, // 'VIP', 'Standard'
          price: s.price || (s.seat_type === 'VIP' ? s.vip_price : s.standard_price) || 0,
          section: s.section
        }))
        setSeats(mappedSeats)

      } catch (error) {
        console.error('Error fetching booking data:', error)
        toast.error('Không thể tải thông tin phòng vé')
      } finally {
        setLoading(false)
      }
    }

    if (showtimeId) fetchData()
  }, [showtimeId])

  // Timer logic
  useEffect(() => {
    if (selectedSeats.length === 0) {
      setTimeLeft(600)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setSelectedSeats([])
          toast.error('Hết thời gian giữ chỗ!')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [selectedSeats])

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

  const handleConfirmBooking = async () => {
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

      // 2. Create Tickets and Update Seat Status
      const ticketPromises = selectedSeats.map(async (seat) => {
        // Create ticket
        const { error: ticketError } = await supabase
          .from('tickets')
          .insert({
            booking_id: booking.id,
            seat_id: seat.id,
            price: seat.price,
            ticket_type: seat.type
          })

        if (ticketError) throw ticketError

        // Update seat status to 'sold'
        const { error: seatUpdateError } = await supabase
          .from('seating_chart')
          .update({ status: 'sold', user_id: user.id })
          .eq('id', seat.id)

        if (seatUpdateError) throw seatUpdateError
      })

      await Promise.all(ticketPromises)

      toast.success('Đặt vé thành công!')
      navigate('/my-tickets') // Or wherever appropriate

    } catch (error) {
      console.error('Booking Error:', error)
      toast.error('Có lỗi xảy ra trong quá trình đặt vé')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )

  if (!event || !showtime) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-bold">Không tìm thấy thông tin lịch diễn</h2>
      <button onClick={() => navigate(-1)} className="text-primary hover:underline">Quay lại</button>
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Seat Map */}
          <div className="flex-1 bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Chọn chỗ ngồi</h2>
                <p className="text-sm text-muted-foreground">
                  Vui lòng chọn ghế bạn muốn ngồi trong sự kiện
                </p>
              </div>
            </div>
            
            <SeatMap 
              seats={seats} 
              selectedSeats={selectedSeats} 
              onSeatClick={handleSeatClick} 
              layout={event.layout_json}
            />
          </div>

          {/* Right: Sidebar */}
          <div className="w-full lg:w-96">
            <div className="sticky top-24 bg-card rounded-2xl border border-border p-6 shadow-sm">
              <BookingSidebar 
                event={{
                  title: event.name,
                  image: event.image_url,
                  date: new Date(showtime.start_time).toLocaleDateString('vi-VN'),
                  time: new Date(showtime.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                  venue: event.location,
                  address: event.location // Use location as address if not separate
                }}
                selectedSeats={selectedSeats}
                onRemoveSeat={handleSeatClick}
                onConfirm={handleConfirmBooking}
                timeLeft={timeLeft}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default BookingPage

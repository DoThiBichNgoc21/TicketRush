import React, { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Header } from '../../components/header'
import { Footer } from '../../components/footer'
import { SeatMap } from '../../components/seat-selection/seat-map'
import { BookingSidebar } from '../../components/seat-selection/booking-sidebar'
import { supabase } from '../../lib/supabaseClient'
import axiosInstance from '../../lib/axiosInstance'
import { fetchSeatingChartRows } from '../../lib/fetchSeatingChart'
import { useSeatBooking } from '../../hooks/useSeatBooking'
import { toast } from 'sonner'

const BookingPage = () => {
  const { showtimeId } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [showtime, setShowtime] = useState(null)
  const [seats, setSeats] = useState([])
  const [loading, setLoading] = useState(true)

  const reloadSeats = useCallback(async () => {
    if (!showtime?.id) return []
    const mapped = await fetchSeatingChartRows(showtime.id)
    setSeats(mapped)
    return mapped
  }, [showtime?.id])

  const {
    userId,
    selectedSeats,
    timeLeft,
    seatActionLoading,
    handleSeatClick,
    goToCheckout,
    maxSeats,
  } = useSeatBooking({
    eventId: event?.id,
    showtimeId: showtime?.id,
    reloadSeats,
  })

  useEffect(() => {
    const controller = new AbortController()

    async function fetchData() {
      setLoading(true)
      const idParam = String(showtimeId ?? '').trim()
      try {
        let stData = null
        let normalizedEvent = null

        try {
          const { data: apiRes } = await axiosInstance.get(
            `/events/showtimes/${idParam}/booking`,
            { signal: controller.signal }
          )
          stData = apiRes?.showtime
          normalizedEvent = apiRes?.event
        } catch (apiErr) {
          if (apiErr?.code === 'ERR_CANCELED') return
          console.warn('[BookingPage] API booking detail:', apiErr?.message || apiErr)
          const { data, error: stError } = await supabase
            .from('showtimes')
            .select('*, events(*)')
            .eq('id', idParam)
            .single()
          if (stError) throw stError
          stData = data
          const rawEvent = data?.events
          normalizedEvent = Array.isArray(rawEvent) ? rawEvent[0] : rawEvent
        }

        if (!stData || !normalizedEvent) {
          throw new Error('Thiếu dữ liệu suất chiếu / sự kiện')
        }

        setShowtime(stData)
        setEvent(normalizedEvent)

        const mappedSeats = await fetchSeatingChartRows(stData.id, controller.signal)
        if (!controller.signal.aborted) {
          setSeats(mappedSeats)
        }
      } catch (error) {
        if (error?.code === 'ERR_CANCELED') return
        console.error('Error fetching booking data:', error)
        toast.error('Không thể tải thông tin phòng vé. Đảm bảo backend đang chạy (port 3000).')
        setSeats([])
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    if (showtimeId) fetchData()
    return () => controller.abort()
  }, [showtimeId])

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
          <div className="flex-1 bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Chọn chỗ ngồi</h2>
                <p className="text-sm text-muted-foreground">
                  Ghế được giữ 10 phút sau khi chọn — chỉ một người giữ được mỗi ghế
                </p>
              </div>
            </div>
            
            <SeatMap 
              seats={seats} 
              selectedSeats={selectedSeats} 
              onSeatClick={handleSeatClick} 
              layout={event.layout_json}
              seatsLoading={loading}
              currentUserId={userId}
              seatActionLoading={seatActionLoading}
            />
          </div>

          <div className="w-full lg:w-96">
            <div className="sticky top-24 bg-card rounded-2xl border border-border p-6 shadow-sm">
              <BookingSidebar 
                event={{
                  title: event.name,
                  image: event.image_url,
                  date: new Date(showtime.start_time).toLocaleDateString('vi-VN'),
                  time: new Date(showtime.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                  venue: event.location,
                  address: event.location
                }}
                selectedSeats={selectedSeats}
                onRemoveSeat={handleSeatClick}
                onCheckout={() =>
                  goToCheckout({ event, showtime })
                }
                timeLeft={timeLeft}
                isBusy={seatActionLoading}
                maxSeats={maxSeats}
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

import { useCallback, useEffect, useRef, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { toast } from 'sonner'

import {

  holdSeat,

  releaseSeat,

  releaseSeats,

  getHoldErrorMessage,

  getUserToken,

  getLockedSeats,

} from '../lib/seatHoldApi'

import { saveCheckoutDraft } from '../lib/checkoutSession'



const HOLD_SECONDS = 600

const MAX_SEATS = 8



function getCurrentUser() {

  const token = getUserToken()

  if (!token) return null

  try {

    const raw = localStorage.getItem('user_info')

    return raw ? JSON.parse(raw) : null

  } catch {

    return null

  }

}



function authErrorMessage(err) {

  if (err?.authSessionExpired) {

    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'

  }

  const msg = err.response?.data?.message

  if (msg?.includes('Token') || msg?.includes('token')) {

    return 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.'

  }

  if (msg?.includes('người dùng')) {

    return 'Vui lòng đăng nhập bằng tài khoản User (không phải Admin) để đặt vé.'

  }

  return msg || err.message

}



/**

 * Giữ ghế: available -> locked (10 phút / phiên)

 * Thanh toán giả lập qua trang checkout

 */

export function useSeatBooking({ eventId, showtimeId, reloadSeats }) {

  const navigate = useNavigate()

  const user = getCurrentUser()

  const userId = user?.id ?? null



  const [selectedSeats, setSelectedSeats] = useState([])

  const [timeLeft, setTimeLeft] = useState(HOLD_SECONDS)

  const [seatActionLoading, setSeatActionLoading] = useState(false)

  const [isLoadingLockedSeats, setIsLoadingLockedSeats] = useState(false)


  const selectedRef = useRef(selectedSeats)

  selectedRef.current = selectedSeats

  const prevShowtimeRef = useRef(showtimeId)

  const sessionExpiresRef = useRef(null)

  const skipReleaseOnUnmountRef = useRef(false)

  const hasLoadedLockedSeatsRef = useRef(false)


  const refreshSeats = useCallback(async () => {

    if (!reloadSeats) return

    await reloadSeats()

  }, [reloadSeats])



  const releaseAllSelected = useCallback(async (seatList) => {

    const ids = (seatList ?? selectedRef.current).map((s) => s.id)

    if (!ids.length || !userId) return

    try {

      await releaseSeats(ids)

    } catch (e) {

      console.warn('[releaseSeats]', e?.message || e)

    }

  }, [userId])



  // const syncSessionExpiry = useCallback((heldUntilIso) => {

  //   if (!heldUntilIso) return

  //   const ts = new Date(heldUntilIso).getTime()

  //   if (!sessionExpiresRef.current || ts < sessionExpiresRef.current) {

  //     sessionExpiresRef.current = ts

  //   }
  const syncSessionExpiry = useCallback((heldUntilIso, sessionLockedAtIso) => {
    // Use session_locked_at from backend if available, otherwise use held_until
    if (sessionLockedAtIso) {
      const sessionLockedAt = new Date(sessionLockedAtIso).getTime()
      if (!sessionExpiresRef.current) {
        sessionExpiresRef.current = sessionLockedAt + HOLD_SECONDS * 1000
      }
    } else if (heldUntilIso) {
      const ts = new Date(heldUntilIso).getTime()
      if (!sessionExpiresRef.current || ts < sessionExpiresRef.current) {
        sessionExpiresRef.current = ts
      }
    }
  }, [])


// Load locked seats when showtime changes or on first mount
  useEffect(() => {

    if (

      prevShowtimeRef.current != null &&

      showtimeId != null &&

      prevShowtimeRef.current !== showtimeId &&

      selectedRef.current.length > 0

    ) {

      const toRelease = [...selectedRef.current]

      setSelectedSeats([])

      sessionExpiresRef.current = null

      releaseAllSelected(toRelease)

      hasLoadedLockedSeatsRef.current = false

    }

    prevShowtimeRef.current = showtimeId

  }, [showtimeId, releaseAllSelected])

// Load existing locked seats from backend
  useEffect(() => {
    if (!showtimeId || !userId || hasLoadedLockedSeatsRef.current) return
 
    const loadLockedSeats = async () => {
      setIsLoadingLockedSeats(true)
      try {
        const result = await getLockedSeats(showtimeId)
        if (result?.success && result?.seats?.length > 0) {
          const lockedSeats = result.seats.map(seat => ({
            id: seat.id,
            row: seat.row,
            column: seat.column,
            status: 'locked',
            type: seat.type,
            price: seat.price,
            section: seat.section,
            floor: seat.floor,
            user_id: userId,
          }))
          setSelectedSeats(lockedSeats)
 
          // Use session_locked_at from backend for timer
          if (result.session_locked_at) {
            sessionExpiresRef.current = result.session_locked_at + HOLD_SECONDS * 1000
          }
        }
      } catch (err) {
        console.warn('[loadLockedSeats]', err?.message || err)
      } finally {
        setIsLoadingLockedSeats(false)
        hasLoadedLockedSeatsRef.current = true
      }
    }
 
    loadLockedSeats()
  }, [showtimeId, userId])

  useEffect(() => {

    if (selectedSeats.length === 0) {

      sessionExpiresRef.current = null

      setTimeLeft(HOLD_SECONDS)

      return

    }



    if (!sessionExpiresRef.current) {

      sessionExpiresRef.current = Date.now() + HOLD_SECONDS * 1000

    }



    const tick = () => {

      const left = Math.max(

        0,

        Math.floor((sessionExpiresRef.current - Date.now()) / 1000)

      )

      setTimeLeft(left)

      if (left <= 0) {

        const toRelease = [...selectedRef.current]

        setSelectedSeats([])

        sessionExpiresRef.current = null

        releaseAllSelected(toRelease).then(() => refreshSeats())

        toast.error('Hết thời gian giữ chỗ! Ghế đã được nhả (Released).')

      }

    }



    tick()

    const id = setInterval(tick, 1000)

    return () => clearInterval(id)

  }, [selectedSeats.length, releaseAllSelected, refreshSeats])



  useEffect(() => {

    const poll = setInterval(() => {

      if (selectedRef.current.length > 0) refreshSeats()

    }, 15000)

    return () => clearInterval(poll)

  }, [refreshSeats])



  useEffect(() => {

    return () => {

      if (skipReleaseOnUnmountRef.current) return

      const remaining = selectedRef.current

      if (remaining.length > 0) {

        releaseAllSelected(remaining)

      }

    }

  }, [releaseAllSelected])



  const handleSeatClick = useCallback(

    async (seat) => {

      if (seatActionLoading) return



      if (!userId || !getUserToken()) {

        toast.error('Vui lòng đăng nhập tài khoản User để chọn ghế')

        navigate('/login', { state: { from: window.location.pathname } })

        return

      }



      const isSelected = selectedSeats.some((s) => s.id === seat.id)



      if (isSelected) {

        setSeatActionLoading(true)

        try {

          await releaseSeat(seat.id)

          const next = selectedSeats.filter((s) => s.id !== seat.id)

          setSelectedSeats(next)

          if (next.length === 0) sessionExpiresRef.current = null

          await refreshSeats()

        } catch (err) {

          toast.error(authErrorMessage(err) || 'Không thể bỏ giữ ghế')

          if (err.authSessionExpired) navigate('/login')

        } finally {

          setSeatActionLoading(false)

        }

        return

      }



      if (selectedSeats.length >= MAX_SEATS) {

        toast.warning(`Bạn chỉ có thể chọn tối đa ${MAX_SEATS} ghế`)

        return

      }



      if (seat.status === 'sold') {

        toast.error('Ghế đã được bán (Sold)')

        return

      }



      if (

        seat.status === 'locked' &&

        seat.user_id &&

        seat.user_id !== userId

      ) {

        toast.error('Ghế đang được người khác giữ (Locked)')

        return

      }



      setSeatActionLoading(true)

      try {

        const result = await holdSeat(seat.id)

        if (!result?.success) {

          toast.error(getHoldErrorMessage(result))

          await refreshSeats()

          return

        }



        //syncSessionExpiry(result.held_until)
        syncSessionExpiry(result.held_until, result.session_locked_at)


        const held = result.seat

          ? {

              id: result.seat.id,

              row: result.seat.row,

              column: result.seat.column,

              status: 'locked',

              type: result.seat.type,

              price: result.seat.price,

              section: result.seat.section,

              floor: result.seat.floor,

              user_id: userId,

            }

          : { ...seat, status: 'locked', user_id: userId }



        setSelectedSeats((prev) => [...prev, held])

        await refreshSeats()

      } catch (err) {

        if (err.authSessionExpired) {

          toast.error(authErrorMessage(err))

          navigate('/login')

        } else {

          const payload = err.response?.data

          toast.error(

            getHoldErrorMessage(payload) ||

              authErrorMessage(err) ||

              'Không thể giữ ghế'

          )

        }

        await refreshSeats()

      } finally {

        setSeatActionLoading(false)

      }

    },

    [

      seatActionLoading,

      userId,

      navigate,

      selectedSeats,

      refreshSeats,

      syncSessionExpiry,

    ]

  )



  const goToCheckout = useCallback(

    ({ event, showtime }) => {

      if (!selectedSeats.length) {

        toast.error('Vui lòng chọn ít nhất một ghế')

        return

      }

      if (!userId || !getUserToken()) {

        toast.error('Vui lòng đăng nhập để thanh toán')

        navigate('/login')

        return

      }



      if (!sessionExpiresRef.current) {

        sessionExpiresRef.current = Date.now() + HOLD_SECONDS * 1000

      }



      skipReleaseOnUnmountRef.current = true

      saveCheckoutDraft(showtimeId, {

        eventId,

        showtimeId,

        seats: selectedSeats,

        sessionExpiresAt: sessionExpiresRef.current,

        event: {

          title: event?.name || event?.title,

          venue: event?.location,

          image: event?.image_url,

        },

        showtime: {

          date: showtime?.start_time

            ? new Date(showtime.start_time).toLocaleDateString('vi-VN')

            : '',

          time: showtime?.start_time

            ? new Date(showtime.start_time).toLocaleTimeString('vi-VN', {

                hour: '2-digit',

                minute: '2-digit',

              })

            : '',

        },

      })



      navigate(`/booking/${showtimeId}/checkout`)

    },

    [selectedSeats, userId, eventId, showtimeId, navigate]

  )



  return {

    userId,

    selectedSeats,

    timeLeft,

    seatActionLoading,

    handleSeatClick,

    goToCheckout,

    maxSeats: MAX_SEATS,

    isLoadingLockedSeats,
  }

}


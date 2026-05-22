import bookingAxios, { getUserToken } from './bookingAxios'

import { mapSeatingChartRows } from './mapSeatingChart'



export { getUserToken }



const HOLD_MESSAGES = {

  LOCKED_BY_OTHER: 'Ghế đang được người khác giữ',

  RACE_LOST: 'Ghế vừa được người khác chọn, vui lòng chọn ghế khác',

  SOLD: 'Ghế đã được bán',

  SESSION_EXPIRED: 'Phiên giữ ghế đã hết hạn, vui lòng chọn lại',

  UNAVAILABLE: 'Ghế không khả dụng',

  MIGRATION_REQUIRED:

    'Hệ thống chưa cấu hình giữ ghế. Liên hệ quản trị hoặc chạy migration SQL trên Supabase.',

}



export function getHoldErrorMessage(payload) {

  if (!payload) return 'Không thể giữ ghế'

  return payload.message || HOLD_MESSAGES[payload.code] || 'Không thể giữ ghế'

}



export async function holdSeat(seatId) {

  const { data } = await bookingAxios.post(`/booking/seats/${seatId}/hold`)

  return data

}



export async function releaseSeat(seatId) {

  const { data } = await bookingAxios.post(`/booking/seats/${seatId}/release`)

  return data

}



export async function releaseSeats(seatIds) {

  if (!seatIds?.length) return { success: true, released: 0 }

  const { data } = await bookingAxios.post('/booking/seats/release', {

    seat_ids: seatIds,

  })

  return data

}



export async function confirmBooking({ eventId, showtimeId, seatIds, totalAmount, discountId, discountAmount }) {
  const { data } = await bookingAxios.post('/booking/confirm', {
    event_id: eventId,
    showtime_id: showtimeId,
    seat_ids: seatIds,
    total_amount: totalAmount,
    p_discount_id: discountId,
    p_discount_amount: discountAmount,
  })
  return data
}

export async function validateDiscount({ code, eventId, totalPrice, quantity }) {
  // Lưu ý: Endpoint này ở /api/discounts/validate (theo server.js config)
  const { data } = await bookingAxios.post('/discounts/validate', {
    code,
    eventId,
    totalPrice,
    quantity
  })
  return data
}

export async function getAvailableDiscounts(eventId) {
  const { data } = await bookingAxios.get('/discounts/available', {
    params: { eventId }
  })
  return data
}

export async function getLockedSeats(showtimeId) {
  const { data } = await bookingAxios.get(`/booking/showtimes/${showtimeId}/locked-seats`)
  return data
}

/** Ghế từ API seating-chart (đã map user_id, locked_at) */

export function mapSeatsFromApi(rows) {

  return (rows ?? []).map((s) => ({

    id: s.id,

    row: s.row,

    column: parseInt(String(s.seat_number ?? s.column ?? ''), 10),

    status: s.status,

    type: s.seat_type ?? s.type,

    price: Number(s.price) || 0,

    section: s.section,

    floor: s.floor ?? null,

    user_id: s.user_id ?? null,

    locked_at: s.locked_at ?? null,

  }))

}

export { mapSeatingChartRows }


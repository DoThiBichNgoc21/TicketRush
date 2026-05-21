import supabase from "../config/supabase.js"

import { mapSeatForClient } from "../utils/seatStatus.js"



const HOLD_SECONDS = 600



/** ID bảng dùng BIGINT (vd. 7691), không phải UUID */

function toBigIntId(value, fieldName) {

  const n = Number(value)

  if (!Number.isFinite(n) || n < 1) {

    throw new Error(`${fieldName} không hợp lệ`)

  }

  return Math.trunc(n)

}



function rpcResult(data, error) {

  if (error) {

    const msg = error.message || ""

    if (msg.includes("invalid input syntax for type uuid")) {

      return {

        ok: false,

        status: 503,

        body: {

          success: false,

          code: "MIGRATION_BIGINT_REQUIRED",

          message:

            "Function SQL đang dùng UUID nhưng DB dùng số. Chạy backend/migrations/002_seat_hold_bigint_ids.sql trong Supabase SQL Editor.",

        },

      }

    }

    if (msg.includes("Could not find the function") || msg.includes("hold_seat")) {

      return {

        ok: false,

        status: 503,

        body: {

          success: false,

          code: "MIGRATION_REQUIRED",

          message:

            "Chưa cài đặt function giữ ghế. Chạy 001_seat_hold_concurrency.sql rồi 002_seat_hold_bigint_ids.sql trong Supabase SQL Editor.",

        },

      }

    }

    return {

      ok: false,

      status: 500,

      body: { success: false, code: "RPC_ERROR", message: msg },

    }

  }

  return { ok: true, data: data ?? {} }

}



function mapRpcSeat(payload) {

  const raw = payload?.seat

  if (!raw) return null

  return mapSeatForClient(raw)

}



/** POST /api/booking/seats/:seatId/hold */

export const holdSeat = async (req, res) => {

  try {

    const { seatId } = req.params

    const userId = req.user.id



    const { data, error } = await supabase.rpc("hold_seat", {

      p_seat_id: toBigIntId(seatId, "seat_id"),

      p_user_id: toBigIntId(userId, "user_id"),

      p_hold_seconds: HOLD_SECONDS,

    })



    const result = rpcResult(data, error)

    if (!result.ok) return res.status(result.status).json(result.body)



    const payload = result.data

    if (!payload.success) {

      const status =

        payload.code === "LOCKED_BY_OTHER" || payload.code === "RACE_LOST"

          ? 409

          : payload.code === "SOLD"

            ? 409

            : 400

      return res.status(status).json(payload)

    }



    return res.status(200).json({

      ...payload,

      seat: mapRpcSeat(payload),

      hold_seconds: HOLD_SECONDS,

    })

  } catch (err) {

    return res.status(500).json({ success: false, message: err.message })

  }

}



/** POST /api/booking/seats/:seatId/release */

export const releaseSeat = async (req, res) => {

  try {

    const { seatId } = req.params

    const userId = req.user.id



    const { data, error } = await supabase.rpc("release_seat", {

      p_seat_id: toBigIntId(seatId, "seat_id"),

      p_user_id: toBigIntId(userId, "user_id"),

    })



    const result = rpcResult(data, error)

    if (!result.ok) return res.status(result.status).json(result.body)



    const payload = result.data

    return res.status(payload.success ? 200 : 400).json({

      ...payload,

      seat: mapRpcSeat(payload),

    })

  } catch (err) {

    return res.status(500).json({ success: false, message: err.message })

  }

}



/** POST /api/booking/seats/release — body: { seat_ids: [] } */

export const releaseSeats = async (req, res) => {

  try {

    const userId = req.user.id

    const seatIds = Array.isArray(req.body?.seat_ids) ? req.body.seat_ids : []



    const { data, error } = await supabase.rpc("release_seats", {

      p_seat_ids: seatIds.map((id) => toBigIntId(id, "seat_id")),

      p_user_id: toBigIntId(userId, "user_id"),

    })



    const result = rpcResult(data, error)

    if (!result.ok) return res.status(result.status).json(result.body)



    return res.status(200).json(result.data)

  } catch (err) {

    return res.status(500).json({ success: false, message: err.message })

  }

}



/** POST /api/booking/confirm */

export const confirmBooking = async (req, res) => {

  try {

    const userId = req.user.id

    const { event_id, showtime_id, seat_ids, total_amount } = req.body



    if (!event_id || !showtime_id || !Array.isArray(seat_ids) || seat_ids.length === 0) {

      return res.status(400).json({

        success: false,

        message: "Thiếu event_id, showtime_id hoặc danh sách ghế",

      })

    }



    const { data, error } = await supabase.rpc("confirm_booking", {

      p_user_id: toBigIntId(userId, "user_id"),

      p_event_id: toBigIntId(event_id, "event_id"),

      p_showtime_id: toBigIntId(showtime_id, "showtime_id"),

      p_seat_ids: seat_ids.map((id) => toBigIntId(id, "seat_id")),

      p_total_amount: total_amount,

    })



    const result = rpcResult(data, error)

    if (!result.ok) return res.status(result.status).json(result.body)



    const payload = result.data

    if (!payload.success) {

      const status =

        payload.code === "PRICE_MISMATCH" || String(payload.message || "").includes("LOCKED")

          ? 409

          : 400

      return res.status(status).json(payload)

    }



    return res.status(201).json(payload)

  } catch (err) {

    return res.status(500).json({ success: false, message: err.message })

  }

}

/** GET /api/booking/showtimes/:showtimeId/locked-seats */
export const getLockedSeats = async (req, res) => {
  try {
    const { showtimeId } = req.params
    const userId = req.user.id
 
    const { data, error } = await supabase
      .from('seating_chart')
      .select('*')
      .eq('showtime_id', toBigIntId(showtimeId, "showtime_id"))
      .eq('user_id', toBigIntId(userId, "user_id"))
      .eq('status', 'locked')
 
    if (error) {
      return res.status(500).json({ success: false, message: error.message })
    }
 
    const seats = (data || []).map(mapSeatForClient)
 
    // Tính thời gian hết hạn từ ghế đầu tiên (cũ nhất)
    const sessionLockedAt = seats.length > 0 
      ? seats.reduce((min, seat) => {
          const lockedAt = seat.locked_at ? new Date(seat.locked_at).getTime() : Date.now()
          return lockedAt < min ? lockedAt : min
        }, Date.now())
      : null
 
    return res.status(200).json({
      success: true,
      seats,
      session_locked_at: sessionLockedAt,
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}
 
/** POST /api/booking/confirm */
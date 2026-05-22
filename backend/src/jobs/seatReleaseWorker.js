import supabase from "../config/supabase.js"

const HOLD_SECONDS = Number(process.env.SEAT_HOLD_SECONDS) || 600
const INTERVAL_MS = Number(process.env.SEAT_RELEASE_INTERVAL_MS) || 30_000

let timer = null
let running = false

export async function runSeatExpireJob() {
  if (running) return
  running = true
  try {
    const { data, error } = await supabase.rpc("expire_stale_seat_locks", {
      p_hold_seconds: HOLD_SECONDS,
    })
    if (error) {
      console.error("[seatReleaseWorker] RPC error:", error.message)
      return
    }
    const count = data?.released_count ?? 0
    if (count > 0) {
      console.log(
        `[seatReleaseWorker] Released ${count} expired seat(s):`,
        data?.released_seat_ids
      )
    }
  } catch (err) {
    console.error("[seatReleaseWorker]", err.message)
  } finally {
    running = false
  }
}

export function startSeatReleaseWorker() {
  if (timer) return
  runSeatExpireJob()
  timer = setInterval(runSeatExpireJob, INTERVAL_MS)
  console.log(
    `[seatReleaseWorker] Started — quét mỗi ${INTERVAL_MS / 1000}s, hold ${HOLD_SECONDS}s`
  )
}

export function stopSeatReleaseWorker() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

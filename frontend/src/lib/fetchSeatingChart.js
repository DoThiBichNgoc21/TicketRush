import axiosInstance from './axiosInstance'
import { mapSeatingChartRows } from './mapSeatingChart'
import { fetchAllSeatingChartFromSupabase } from './fetchAllSeatingChart'

/**
 * Tải ghế theo showtime_id — ưu tiên API backend (service role),
 * vì bảng showtimes thường bị RLS chặn với anon key.
 */
export async function fetchSeatingChartRows(showtimeId, signal) {
  const id = Number(showtimeId)
  if (!Number.isFinite(id)) return []

  // Supabase phân trang — đủ ghế (API/PostgREST hay bị giới hạn 1000 dòng nếu backend chưa cập nhật)
  try {
    const rows = await fetchAllSeatingChartFromSupabase(id, signal)
    if (rows.length > 0) {
      return mapSeatingChartRows(rows)
    }
  } catch (err) {
    if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') throw err
    console.warn('[fetchSeatingChart] Supabase:', err?.message || err)
  }

  try {
    const { data } = await axiosInstance.get(
      `/events/showtimes/${id}/seating-chart`,
      { signal }
    )
    return mapSeatingChartRows(data?.seats ?? [])
  } catch (err) {
    if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') throw err
    console.warn('[fetchSeatingChart] API:', err?.message || err)
    return []
  }
}

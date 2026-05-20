import { supabase } from './supabaseClient'

/** Tải hết ghế (Supabase mặc định giới hạn ~1000 dòng/request) */
export async function fetchAllSeatingChartFromSupabase(showtimeId, signal) {
  const id = Number(showtimeId)
  if (!Number.isFinite(id)) return []

  const pageSize = 1000
  const all = []
  let from = 0

  while (true) {
    if (signal?.aborted) {
      const err = new Error('Aborted')
      err.name = 'CanceledError'
      err.code = 'ERR_CANCELED'
      throw err
    }

    const { data, error } = await supabase
      .from('seating_chart')
      .select('*')
      .eq('showtime_id', id)
      .range(from, from + pageSize - 1)

    if (error) throw error
    if (!data?.length) break

    all.push(...data)
    if (data.length < pageSize) break
    from += pageSize
  }

  return all
}

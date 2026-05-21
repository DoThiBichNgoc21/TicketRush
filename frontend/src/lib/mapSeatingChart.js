/** Chuẩn hóa một dòng từ bảng `seating_chart` (Supabase/API) sang props SeatMap */
export function mapSeatingChartRows(rows) {
  return (rows ?? []).map((s) => ({
    id: s.id,
    row: s.row,
    column: parseInt(String(s.seat_number ?? ""), 10),
    status: s.status,
    type: s.seat_type,
    price: Number(s.price) || 0,
    section: s.section,
    floor: s.floor ?? null,
    user_id: s.user_id ?? null,
    locked_at: s.locked_at ?? null,
  }))
}

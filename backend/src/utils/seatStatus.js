/** Chuẩn hóa trạng thái ghế khi trả về client (khóa hết hạn coi như available để hiển thị) */
export function normalizeSeatRow(row, holdSeconds = 600) {
  if (!row) return row
  if (row.status !== "locked" || !row.locked_at) return row

  const lockedAt = new Date(row.locked_at).getTime()
  const expired = Date.now() - lockedAt > holdSeconds * 1000
  if (!expired) return row

  return {
    ...row,
    status: "available",
    user_id: null,
    locked_at: null,
  }
}

export function mapSeatForClient(row) {
  const normalized = normalizeSeatRow(row)
  return {
    id: normalized.id,
    row: normalized.row,
    column: parseInt(String(normalized.seat_number ?? ""), 10),
    status: normalized.status,
    type: normalized.seat_type,
    price: Number(normalized.price) || 0,
    section: normalized.section,
    floor: normalized.floor ?? null,
    user_id: normalized.user_id ?? null,
    locked_at: normalized.locked_at ?? null,
  }
}

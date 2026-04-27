"use client"

import { cn } from "@/lib/utils"

const seatStatusStyles = {
  available: "bg-white/90 hover:bg-white hover:scale-110 cursor-pointer border-white/50",
  vip: "bg-amber-400 hover:bg-amber-300 hover:scale-110 cursor-pointer border-amber-500",
  selected: "bg-primary hover:bg-primary/90 scale-110 cursor-pointer border-primary ring-2 ring-primary/50",
  sold: "bg-muted/50 cursor-not-allowed border-muted",
  locked: "bg-muted/30 cursor-not-allowed border-muted/50",
}

const rowLabels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]

export function SeatMap({ seats, selectedSeats, onSeatClick, maxSeats = 8 }) {
  const getSeatByPosition = (row, col) => {
    return seats.find((s) => s.row === row && s.column === col)
  }

  const isSeatSelected = (seat) => {
    return selectedSeats.some((s) => s.id === seat.id)
  }

  const getSeatStatus = (seat) => {
    if (isSeatSelected(seat)) return "selected"
    return seat.status
  }

  return (
    <div className="w-full">
      {/* Stage */}
      <div className="relative mb-8">
        <div className="mx-auto w-full max-w-md">
          <div className="relative">
            <div className="h-3 rounded-t-full bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
            <div className="flex h-12 items-center justify-center rounded-b-lg bg-gradient-to-b from-primary/30 to-transparent">
              <span className="text-sm font-medium tracking-widest text-foreground/70">SÂN KHẤU</span>
            </div>
          </div>
        </div>
        {/* Stage glow effect */}
        <div className="absolute -bottom-4 left-1/2 h-8 w-3/4 -translate-x-1/2 bg-primary/10 blur-xl" />
      </div>

      {/* Seat Grid */}
      <div className="mx-auto max-w-4xl overflow-x-auto px-4">
        <div className="min-w-[600px] space-y-2 pb-4">
          {rowLabels.map((row) => (
            <div key={row} className="flex items-center justify-center gap-1 sm:gap-2">
              {/* Row label left */}
              <span className="w-6 text-center text-xs font-medium text-muted-foreground sm:text-sm">
                {row}
              </span>
              
              {/* Seats */}
              <div className="flex gap-1 sm:gap-1.5">
                {Array.from({ length: 15 }, (_, i) => {
                  const seat = getSeatByPosition(row, i + 1)
                  if (!seat) return <div key={i} className="h-6 w-6 sm:h-8 sm:w-8" />
                  
                  const status = getSeatStatus(seat)
                  const isClickable = status === "available" || status === "vip" || status === "selected"
                  
                  return (
                    <button
                      key={seat.id}
                      onClick={() => isClickable && onSeatClick(seat)}
                      disabled={!isClickable}
                      className={cn(
                        "relative flex h-6 w-6 items-center justify-center rounded-t-lg border-b-2 text-[10px] font-medium transition-all duration-200 sm:h-8 sm:w-8 sm:text-xs",
                        seatStatusStyles[status],
                        status === "selected" && "text-primary-foreground",
                        status === "vip" && "text-amber-900",
                        status === "available" && "text-background",
                        (status === "sold" || status === "locked") && "text-muted-foreground/50"
                      )}
                      title={`${row}${seat.column} - ${status === "vip" ? "VIP" : "Thường"} - ${seat.price.toLocaleString("vi-VN")}đ`}
                    >
                      {seat.column}
                    </button>
                  )
                })}
              </div>
              
              {/* Row label right */}
              <span className="w-6 text-center text-xs font-medium text-muted-foreground sm:text-sm">
                {row}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 px-4 sm:gap-6">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-t-md border-b-2 border-white/50 bg-white/90 sm:h-6 sm:w-6" />
          <span className="text-xs text-muted-foreground sm:text-sm">Ghế trống</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-t-md border-b-2 border-amber-500 bg-amber-400 sm:h-6 sm:w-6" />
          <span className="text-xs text-muted-foreground sm:text-sm">Ghế VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-t-md border-b-2 border-primary bg-primary ring-2 ring-primary/50 sm:h-6 sm:w-6" />
          <span className="text-xs text-muted-foreground sm:text-sm">Đang chọn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-t-md border-b-2 border-muted bg-muted/50 sm:h-6 sm:w-6" />
          <span className="text-xs text-muted-foreground sm:text-sm">Đã bán / Đang giữ</span>
        </div>
      </div>

      {/* Max seats notice */}
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Bạn có thể chọn tối đa {maxSeats} ghế trong một lần đặt vé
      </p>
    </div>
  )
}

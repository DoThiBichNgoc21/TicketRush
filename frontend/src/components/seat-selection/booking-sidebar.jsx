"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, MapPin, Ticket, X, AlertCircle } from "lucide-react"

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export function BookingSidebar({
  event,
  selectedSeats,
  onRemoveSeat,
  onConfirm,
  timeLeft,
  maxSeats = 8,
}) {
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0)
  const vipSeats = selectedSeats.filter((s) => s.status === "vip")
  const standardSeats = selectedSeats.filter((s) => s.status === "available")

  const isTimeWarning = timeLeft <= 120 // 2 minutes warning

  return (
    <div className="flex h-full flex-col">
      {/* Event Info */}
      <div className="space-y-4">
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-balance text-lg font-bold leading-tight text-foreground">
              {event.title}
            </h3>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="font-medium text-foreground">{event.venue}</p>
              <p className="text-xs">{event.address}</p>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Timer */}
      {selectedSeats.length > 0 && (
        <div
          className={`mb-4 flex items-center justify-between rounded-lg p-3 ${
            isTimeWarning
              ? "bg-destructive/10 text-destructive"
              : "bg-primary/10 text-primary"
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Thời gian giữ ghế</span>
          </div>
          <span className="font-mono text-lg font-bold">{formatTime(timeLeft)}</span>
        </div>
      )}

      {/* Selected Seats */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="flex items-center gap-2 font-semibold">
            <Ticket className="h-4 w-4 text-primary" />
            Ghế đã chọn
          </h4>
          <span className="text-sm text-muted-foreground">
            {selectedSeats.length}/{maxSeats}
          </span>
        </div>

        {selectedSeats.length === 0 ? (
          <div className="rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center">
            <Ticket className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Chưa chọn ghế nào
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Nhấn vào ghế trên sơ đồ để chọn
            </p>
          </div>
        ) : (
          <div className="max-h-[200px] space-y-2 overflow-y-auto pr-1 lg:max-h-[300px]">
            {selectedSeats.map((seat) => (
              <div
                key={seat.id}
                className="flex items-center justify-between rounded-lg bg-card p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                      seat.status === "vip"
                        ? "bg-amber-400 text-amber-900"
                        : "bg-white text-background"
                    }`}
                  >
                    {seat.row}
                    {seat.column}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Hàng {seat.row} - Ghế {seat.column}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {seat.status === "vip" ? "VIP" : "Thường"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-primary">
                    {seat.price.toLocaleString("vi-VN")}đ
                  </span>
                  <button
                    onClick={() => onRemoveSeat(seat)}
                    className="rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator className="my-4" />

      {/* Summary */}
      <div className="space-y-3">
        {vipSeats.length > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Ghế VIP x{vipSeats.length}
            </span>
            <span>
              {vipSeats.reduce((sum, s) => sum + s.price, 0).toLocaleString("vi-VN")}đ
            </span>
          </div>
        )}
        {standardSeats.length > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Ghế Thường x{standardSeats.length}
            </span>
            <span>
              {standardSeats.reduce((sum, s) => sum + s.price, 0).toLocaleString("vi-VN")}đ
            </span>
          </div>
        )}

        <Separator />

        <div className="flex items-center justify-between">
          <span className="font-semibold">Tổng cộng</span>
          <span className="text-xl font-bold text-primary">
            {totalPrice.toLocaleString("vi-VN")}đ
          </span>
        </div>

        <Button
          onClick={onConfirm}
          disabled={selectedSeats.length === 0}
          className="w-full"
          size="lg"
        >
          Xác nhận đặt vé
          {selectedSeats.length > 0 && ` (${selectedSeats.length} ghế)`}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Vé sẽ được giữ trong 10 phút kể từ khi chọn ghế đầu tiên
        </p>
      </div>
    </div>
  )
}

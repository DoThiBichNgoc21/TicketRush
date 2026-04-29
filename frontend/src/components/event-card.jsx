"use client"

import { useState } from "react"
import { Clock, MapPin, Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EventCard({ event }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="group relative bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Poster */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <div
          className="w-full h-full bg-secondary transition-transform duration-500 group-hover:scale-110"
          style={{
            background: event.poster,
          }}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {event.isHot && (
            <span className="px-2 py-1 bg-accent text-accent-foreground text-xs font-bold rounded">
              HOT
            </span>
          )}
          {event.soldOut && (
            <span className="px-2 py-1 bg-destructive text-destructive-foreground text-xs font-bold rounded">
              HẾT VÉ
            </span>
          )}
        </div>

        {/* Category Badge */}
        <span className="absolute top-2 right-2 px-2 py-1 bg-background/80 backdrop-blur-sm text-foreground text-xs font-medium rounded">
          {event.category}
        </span>

        {/* Overlay on Hover */}
        <div
          className={`absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-3 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"
            }`}
        >
          <Button
            size="sm"
            className="w-10/12 max-w-[140px] text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white gap-2"
            disabled={event.soldOut}
          >
            {event.soldOut ? "Hết vé" : "Mua vé ngay"}
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="w-10/12 max-w-[140px] text-xs sm:text-sm border-foreground/30 text-foreground hover:bg-foreground/10"
          >
            Xem chi tiết
          </Button>
        </div>
      </div>

      {/* Event Info */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 min-h-[48px]">
          {event.title}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            <span>{event.date}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <span>{event.time}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>

          {event.attendees && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4 text-primary shrink-0" />
              <span>{event.attendees}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Giá từ</p>
            <p className="font-bold text-primary">{event.price}</p>
          </div>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            disabled={event.soldOut}
          >
            {event.soldOut ? "HẾT VÉ" : "MUA VÉ"}
          </Button>
        </div>
      </div>
    </div>
  )
}

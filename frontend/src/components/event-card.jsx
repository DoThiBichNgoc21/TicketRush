"use client"

import { useState } from "react"
import { Clock, MapPin, Calendar, Users } from "lucide-react"
import { Button } from "./ui/button"
import { useNavigate } from "react-router-dom"

export function EventCard({ event }) {
  const [isHovered, setIsHovered] = useState(false)
  const navigate = useNavigate()

  const handleDetailClick = () => {
    navigate(`/event/${event.id}`)
  }

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
          className={`absolute inset-0 bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"
            }`}
        >
          <Button
            size="lg"
            className="px-8 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full shadow-2xl hover:scale-105 transition-all"
            disabled={event.soldOut}
            onClick={handleDetailClick}
          >
            {event.soldOut ? "HẾT VÉ" : "MUA VÉ NGAY"}
          </Button>
        </div>
      </div>

      {/* Event Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-foreground mb-3 text-lg line-clamp-2 min-h-[56px] leading-snug group-hover:text-primary transition-colors cursor-pointer" onClick={handleDetailClick}>
          {event.title}
        </h3>

        <div className="space-y-2.5 mb-2">
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground font-medium">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            <span>{event.date}</span>
          </div>

          <div className="flex items-center gap-2.5 text-sm text-muted-foreground font-medium">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <span>{event.time}</span>
          </div>

          <div className="flex items-center gap-2.5 text-sm text-muted-foreground font-medium">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
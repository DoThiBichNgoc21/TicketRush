"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, MapPin, Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getEvents } from "@/api/eventApi"
import { useNavigate } from "react-router-dom"

// No default banners: Hero will only show events fetched from the API

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [banners, setBanners] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          const res = await getEvents({ limit: 10 }) // Lấy 10 cái để lọc cho chắc
          if (!mounted || !res?.events) return

          // Sắp xếp theo ID giảm dần (mới nhất lên đầu) và lấy 5 cái
          const newestEvents = [...res.events]
            .sort((a, b) => b.id - a.id)
            .slice(0, 5)

          const mappedBanners = newestEvents.map((evt) => ({
            id: `ev-${evt.id}`,
            eventId: evt.id,
            title: evt.name || evt.title || "Sự kiện mới",
            subtitle: "MỚI",
            description: evt.description || "Khám phá sự kiện hấp dẫn vừa ra mắt tại TicketRush.",
            location: evt.location || evt.venue || "Việt Nam",
            date: evt.date ? new Date(evt.date).toLocaleDateString("vi-VN") : "",
            gradient: "from-blue-900/80 via-slate-900/60 to-transparent",
            image: evt.image_url || null,
          }))

          setBanners(mappedBanners)
        } catch (e) {
          console.error("HeroBanner: lỗi lấy sự kiện mới", e)
        }
      })()
    return () => {
      mounted = false
    }
  }, [])

  // Reset current slide when banners change
  useEffect(() => {
    setCurrentSlide(0)
  }, [banners.length])

  // Autoplay only when there are multiple banners
  useEffect(() => {
    if (!banners || banners.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners.length])

  const nextSlide = () => {
    if (!banners || banners.length === 0) return
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }
  const prevSlide = () => {
    if (!banners || banners.length === 0) return
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  return (
    <section className="relative h-[550px] md:h-[650px] overflow-hidden bg-secondary">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-all duration-700 ${index === currentSlide
            ? "opacity-100 z-10 pointer-events-auto"
            : "opacity-0 z-0 pointer-events-none"
            }`}
        >
          {/* Event image (if present) */}
          {banner.image ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${banner.image})` }}
            />
          ) : null}

          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

          {/* Pattern background */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M40 40c0-11.046-8.954-20-20-20S0 28.954 0 40s8.954 20 20 20 20-8.954 20-20zm40 0c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Content */}
          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl">
              <span className="inline-block px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-full mb-4 shadow-lg">
                {banner.subtitle}
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
                {banner.title}
              </h1>
              <p className="text-lg text-white/90 mb-6 max-w">
                {banner.description}
              </p>

              {/* Event Info */}
              <div className="flex flex-wrap gap-4 mb-8 text-sm">
                <div className="flex items-center gap-2 text-white/90">
                  <MapPin className="w-4 h-4 text-white" />
                  <span>{banner.location}</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Calendar className="w-4 h-4 text-white" />
                  <span>{banner.date}</span>
                </div>
                {/* <div className="flex items-center gap-2 text-white/90">
                  <Users className="w-4 h-4 text-white" />
                  <span>{banner.attendees} khán giả</span>
                </div> */}
              </div>

              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg px-12 h-14 text-lg font-black rounded-xl transform hover:scale-105 transition-all"
                  onClick={() => banner.eventId ? navigate(`/event/${banner.eventId}`) : null}
                  disabled={!banner.eventId}
                >
                  Mua vé ngay
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/40 backdrop-blur-md px-8 h-14 text-lg font-bold rounded-xl transform hover:scale-105 transition-all"
                  onClick={() => navigate("/su-kien")}
                >
                  Xem tất cả sự kiện
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {banners && banners.length > 0 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 text-white z-50 transition-all"
            onClick={prevSlide}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 text-white z-50 transition-all"
            onClick={nextSlide}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {banners && banners.length > 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-50">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? "w-8 bg-primary" : "bg-foreground/30"
                }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
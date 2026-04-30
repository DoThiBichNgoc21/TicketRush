"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, MapPin, Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

const banners = [
  {
    id: 1,
    title: "BLACKPINK World Tour 2024",
    subtitle: "HOT",
    description: "Siêu sự kiện âm nhạc quốc tế với sự trở lại của nhóm nhạc hàng đầu K-Pop",
    location: "Sân vận động Mỹ Đình, Hà Nội",
    date: "15/06/2024",
    gradient: "from-pink-900/80 via-rose-900/60 to-transparent",
    attendees: "50,000+",
  },
  {
    id: 2,
    title: "Rap Việt Live Concert",
    subtitle: "Sắp diễn ra",
    description: "Đêm nhạc hội tụ các rapper đình đám nhất Việt Nam cùng hàng ngàn khán giả cuồng nhiệt",
    location: "Nhà thi đấu Phú Thọ, TP.HCM",
    date: "20/05/2024",
    gradient: "from-orange-900/80 via-red-900/60 to-transparent",
    attendees: "15,000+",
  },
  {
    id: 3,
    title: "Jazz Night Saigon",
    subtitle: "Premium Event",
    description: "Đêm nhạc Jazz đẳng cấp với sự tham gia của các nghệ sĩ quốc tế và Việt Nam",
    location: "Gem Center, TP.HCM",
    date: "10/05/2024",
    gradient: "from-blue-900/80 via-indigo-900/60 to-transparent",
    attendees: "1,200+",
  },
]

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)

  return (
    <section className="relative h-[550px] md:h-[650px] overflow-hidden bg-secondary">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
        >
          {/* Background with gradient overlay */}
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
              <span className="inline-block px-3 py-1 bg-primary/90 text-primary-foreground text-sm font-medium rounded-full mb-4">
                {banner.subtitle}
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-balance">
                {banner.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-6 max-w-md">
                {banner.description}
              </p>

              {/* Event Info */}
              <div className="flex flex-wrap gap-4 mb-8 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{banner.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{banner.date}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  <span>{banner.attendees} khán giả</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
                  Mua vé ngay
                </Button>
                <Button size="lg" variant="outline" className="border-foreground/30 text-foreground hover:bg-foreground/10">
                  Xem chi tiết
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/20 hover:bg-background/40 text-foreground"
        onClick={prevSlide}
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/20 hover:bg-background/40 text-foreground"
        onClick={nextSlide}
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? "w-8 bg-primary" : "bg-foreground/30"
              }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </section>
  )
}
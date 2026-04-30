"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { EventCard } from "@/components/event-card"

const upcomingEvents = [
  {
    id: 1,
    title: "BLACKPINK World Tour 2024 - Hà Nội",
    date: "15/06/2024",
    time: "19:00",
    location: "Sân vận động Mỹ Đình, Hà Nội",
    category: "Âm nhạc",
    price: "1,500,000đ",
    poster: "linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)",
    isHot: true,
    attendees: "50,000+ khán giả",
  },
  {
    id: 2,
    title: "Rap Việt Live Concert 2024",
    date: "20/05/2024",
    time: "18:30",
    location: "Nhà thi đấu Phú Thọ, TP.HCM",
    category: "Âm nhạc",
    price: "800,000đ",
    poster: "linear-gradient(135deg, #ff9a56 0%, #e74c3c 100%)",
    isHot: true,
    attendees: "15,000+ khán giả",
  },
  {
    id: 3,
    title: "Jazz Night Saigon - Premium",
    date: "10/05/2024",
    time: "20:00",
    location: "Gem Center, TP.HCM",
    category: "Âm nhạc",
    price: "2,000,000đ",
    poster: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    attendees: "1,200 khán giả",
  },
  {
    id: 4,
    title: "Stand-up Comedy Night",
    date: "25/04/2024",
    time: "19:30",
    location: "Nhà hát Lớn Hà Nội",
    category: "Kịch/Hài",
    price: "350,000đ",
    poster: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    id: 5,
    title: "EDM Festival Đà Nẵng 2024",
    date: "01/06/2024",
    time: "16:00",
    location: "Bãi biển Mỹ Khê, Đà Nẵng",
    category: "Festival",
    price: "600,000đ",
    poster: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    isHot: true,
    attendees: "20,000+ khán giả",
  },
  {
    id: 6,
    title: "Sơn Tùng M-TP - Sky Tour 2024",
    date: "30/06/2024",
    time: "19:00",
    location: "Sân vận động Phú Thọ, TP.HCM",
    category: "Âm nhạc",
    price: "1,200,000đ",
    poster: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    isHot: true,
    attendees: "30,000+ khán giả",
  },
]

const comingSoonEvents = [
  {
    id: 7,
    title: "Orchestra Night - Nhạc Nhạc Truyền Thống",
    date: "15/07/2024",
    time: "19:30",
    location: "Nhà hát TP.HCM",
    category: "Âm nhạc",
    price: "500,000đ",
    poster: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  },
  {
    id: 8,
    title: "K-Pop Dance Competition 2024",
    date: "20/07/2024",
    time: "14:00",
    location: "Trung tâm Hội nghị Quốc gia, Hà Nội",
    category: "Festival",
    price: "200,000đ",
    poster: "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
  },
  {
    id: 9,
    title: "Rock Storm 2024 - Hà Nội",
    date: "01/08/2024",
    time: "18:00",
    location: "Sân vận động Hàng Đẫy, Hà Nội",
    category: "Âm nhạc",
    price: "450,000đ",
    poster: "linear-gradient(135deg, #434343 0%, #000000 100%)",
    isHot: true,
  },
  {
    id: 10,
    title: "Workshop: Vocal Training",
    date: "10/08/2024",
    time: "09:00",
    location: "Soul Music Academy, TP.HCM",
    category: "Workshop",
    price: "1,500,000đ",
    poster: "linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)",
  },
]

const soldOutEvents = [
  {
    id: 11,
    title: "Taylor Swift - The Eras Tour",
    date: "Đã diễn ra",
    time: "19:00",
    location: "Sân vận động Mỹ Đình, Hà Nội",
    category: "Âm nhạc",
    price: "3,500,000đ",
    poster: "linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)",
    soldOut: true,
    attendees: "60,000 khán giả",
  },
  {
    id: 12,
    title: "BTS Yet To Come Concert",
    date: "Đã diễn ra",
    time: "18:00",
    location: "Sân vận động Phú Thọ, TP.HCM",
    category: "Âm nhạc",
    price: "2,800,000đ",
    poster: "linear-gradient(135deg, #b721ff 0%, #21d4fd 100%)",
    soldOut: true,
    attendees: "45,000 khán giả",
  },
]

const tabs = [
  { id: "upcoming", label: "SẮP DIỄN RA" },
  { id: "coming-soon", label: "MỞ BÁN SỚM" },
  { id: "sold-out", label: "ĐÃ DIỄN RA" },
]

export function EventSection() {
  const [activeTab, setActiveTab] = useState("upcoming")

  const events = activeTab === "upcoming"
    ? upcomingEvents
    : activeTab === "coming-soon"
      ? comingSoonEvents
      : soldOutEvents

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Sự kiện nổi bật</h2>
          <p className="text-muted-foreground">Khám phá các sự kiện âm nhạc và giải trí hấp dẫn nhất</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all ${activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            Xem tất cả sự kiện
          </Button>
        </div>
      </div>
    </section>
  )
}
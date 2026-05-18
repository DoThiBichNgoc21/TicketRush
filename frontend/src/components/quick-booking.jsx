"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { MapPin, Music, Calendar, Search, Tag } from "lucide-react"
import { useNavigate } from "react-router-dom"

const cities = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Nha Trang", "Cần Thơ"]
const categories = ["Âm nhạc", "Kịch/Hài", "Thể thao", "Festival", "Workshop", "Hội nghị"]
const dates = [
  { label: "Hôm nay", value: "today" },
  { label: "Tuần này", value: "week" },
  { label: "Tháng này", value: "month" },
]

export function QuickBooking() {
  const [city, setCity] = useState("")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState("")
  const [keyword, setKeyword] = useState("")
  const navigate = useNavigate()

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (keyword) params.append('q', keyword)
    if (city && city !== "Tất cả") params.append('city', city)
    if (category && category !== "Tất cả") params.append('cat', category)
    if (date && date !== "Tất cả") params.append('date', date)

    navigate(`/search?${params.toString()}`)
  }

  return (
    <section className="relative -mt-16 z-10 container mx-auto px-4">
      <div className="bg-card rounded-xl p-6 shadow-2xl border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4 text-center">Tìm kiếm sự kiện</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Keyword Search */}
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Tên sự kiện, nghệ sĩ..."
              className="w-full h-12 pl-10 pr-4 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* City Select */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-input border border-border rounded-lg text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Chọn Thành phố</option>
              <option value="Tất cả">Tất cả thành phố</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Category Select */}
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-input border border-border rounded-lg text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Thể loại</option>
              <option value="Tất cả">Tất cả thể loại</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Date Select */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            <select
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-input border border-border rounded-lg text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Thời gian</option>
              {dates.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleSearch}
            className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            <Music className="w-4 h-4 mr-2" />
            Tìm sự kiện
          </Button>
        </div>
      </div>
    </section>
  )
}
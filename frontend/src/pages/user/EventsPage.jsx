import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Header } from '../../components/header'
import { Footer } from '../../components/footer'
import { EventCard } from '../../components/event-card'
import { supabase } from '../../lib/supabaseClient'
import axiosInstance from '../../lib/axiosInstance'
import { Search, SlidersHorizontal, Ticket, MapPin, Calendar, RotateCcw } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Separator } from '../../components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"

const UserEventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // Lấy trực tiếp từ URL để làm "Source of Truth" (Nguồn sự thật duy nhất)
  const queryParam = searchParams.get('q') || ''
  const cityParam = searchParams.get('city') || 'all'
  const categoryParam = searchParams.get('cat') || 'all'
  const statusParam = searchParams.get('status') || 'all'
  const hotParam = searchParams.get('hot') === 'true'

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(queryParam)

  const [dbCategories, setDbCategories] = useState([])
  const [dbLocations, setDbLocations] = useState([])

  // Fetch các tùy chọn bộ lọc từ API
  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        const { data } = await axiosInstance.get('/events/public/filters')
        if (data.success) {
          setDbCategories(data.categories || [])
          setDbLocations(data.locations || [])
        }
      } catch (err) {
        console.error("Failed to fetch filter options:", err)
      }
    }
    fetchFilterOptions()
  }, [])

  // Logic Fetch chính - Dựa hoàn toàn vào Params trên URL
  useEffect(() => {
    async function fetchResults() {
      setLoading(true)
      try {
        // Base Query: Cho phép lấy cả sự kiện đang chạy và đã kết thúc để không bị thiếu số liệu
        let supabaseQuery = supabase
          .from('events')
          .select('*')
          .in('status', ['published', 'ended'])

        // 1. Lọc theo từ khóa
        if (queryParam) {
          supabaseQuery = supabaseQuery.or(`name.ilike.%${queryParam}%,description.ilike.%${queryParam}%,location.ilike.%${queryParam}%,category.ilike.%${queryParam}%`)
        }

        // 2. Lọc theo Thành phố
        if (cityParam !== 'all') {
          supabaseQuery = supabaseQuery.ilike('location', `%${cityParam}%`)
        }

        // 3. Lọc theo Thể loại
        if (categoryParam !== 'all') {
          supabaseQuery = supabaseQuery.eq('category', categoryParam)
        }

        // 4. Lọc theo Sự kiện HOT
        if (hotParam) {
          supabaseQuery = supabaseQuery.eq('is_featured', true)
        }

        // 5. Lọc theo Trạng thái thời gian
        if (statusParam !== 'all') {
          const now = new Date()
          const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString()
          const todayEnd = new Date(now.setHours(23, 59, 59, 999)).toISOString()

          if (statusParam === 'ongoing') {
            supabaseQuery = supabaseQuery.gte('date', todayStart).lte('date', todayEnd)
          } else if (statusParam === 'upcoming') {
            supabaseQuery = supabaseQuery.gt('date', todayEnd)
          } else if (statusParam === 'ended') {
            // Bao gồm cả sự kiện có status là ended HOẶC ngày diễn ra đã qua
            supabaseQuery = supabaseQuery.or(`status.eq.ended,date.lt.${todayStart}`)
          }
        }

        const { data, error } = await supabaseQuery.order('date', { ascending: true })

        if (error) throw error

        const mappedResults = (data || []).map(event => {
          const eventDate = new Date(event.date)
          const isPassed = eventDate < new Date()
          return {
            id: event.id,
            title: event.name,
            date: eventDate.toLocaleDateString('vi-VN'),
            time: eventDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            location: event.location,
            category: event.category,
            price: "Liên hệ",
            poster: event.image_url ? `url(${event.image_url})` : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            isHot: event.is_featured,
            soldOut: event.status === 'ended' || isPassed,
          }
        })

        setResults(mappedResults)
      } catch (err) {
        console.error("Search fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [queryParam, cityParam, categoryParam, statusParam, hotParam])

  // Hàm cập nhật URL khi thay đổi bộ lọc
  const updateParams = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value === 'all' || value === '' || value === false) {
      newParams.delete(key)
    } else {
      newParams.set(key, value)
    }
    setSearchParams(newParams)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    updateParams('q', searchInput.trim())
  }

  const clearFilters = () => {
    setSearchInput('')
    setSearchParams({})
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Sticky Search Bar */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

            {/* CỘT TRÁI: Thanh tìm kiếm */}
            <div className="flex items-center gap-2 w-full md:max-w-2xl flex-1">
              <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 group">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Tìm tên sự kiện, nghệ sĩ, địa điểm..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
                  />
                </div>
                <Button type="submit" className="rounded-xl px-6 bg-primary hover:bg-primary/90 font-bold shrink-0 shadow-lg shadow-primary/20">
                  Tìm kiếm
                </Button>
              </form>

              <Button
                variant="outline"
                size="icon"
                className="rounded-xl h-10 w-10 text-muted-foreground hover:text-primary shrink-0"
                onClick={clearFilters}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            {/* CỘT PHẢI: Text hiển thị kết quả */}
            <div className="flex-shrink-0 md:text-right">
              <h1 className="text-xl md:text-2xl font-bold flex items-center md:justify-end gap-2">
                <Ticket className="w-6 h-6 text-primary" />
                {queryParam ? (
                  <span className="truncate max-w-[200px] lg:max-w-xs">
                    Kết quả: <span className="text-primary">"{queryParam}"</span>
                  </span>
                ) : (
                  <span>Khám phá sự kiện</span>
                )}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Tìm thấy <span className="font-semibold text-foreground">{results.length}</span> sự kiện
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 pb-12">
        <div className="container mx-auto px-4 mt-8">
          <Separator className="mb-8" />

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-52 shrink-0">
              <div className="bg-card border border-border rounded-2xl p-4 shadow-sm sticky top-24 space-y-6">
                <div className="flex items-center gap-2 font-bold text-base mb-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  Bộ lọc
                </div>

                {/* Thể loại */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground px-1">Thể loại</label>
                  <Select value={categoryParam} onValueChange={(val) => updateParams('cat', val)}>
                    <SelectTrigger className="w-full bg-background rounded-lg h-9 text-sm">
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả thể loại</SelectItem>
                      {dbCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Thành phố */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground px-1">Thành phố</label>
                  <Select value={cityParam} onValueChange={(val) => updateParams('city', val)}>
                    <SelectTrigger className="w-full bg-background rounded-lg h-9 text-sm">
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả địa điểm</SelectItem>
                      {dbLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Trạng thái */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground px-1">Trạng thái</label>
                  <Select value={statusParam} onValueChange={(val) => updateParams('status', val)}>
                    <SelectTrigger className="w-full bg-background rounded-lg h-9 text-sm">
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="ongoing">Đang diễn ra</SelectItem>
                      <SelectItem value="upcoming">Sắp diễn ra</SelectItem>
                      <SelectItem value="ended">Đã kết thúc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </aside>

            {/* Results Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-2xl" />
                  ))}
                </div>
              ) : results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-card border border-dashed border-border rounded-[2.5rem]">
                  <h3 className="text-2xl font-bold text-foreground">Không tìm thấy sự kiện nào</h3>
                  <Button className="mt-8 rounded-full px-8" onClick={clearFilters}>Xóa bộ lọc</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default UserEventsPage
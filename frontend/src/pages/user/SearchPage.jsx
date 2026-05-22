import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Header } from '../../components/header'
import { Footer } from '../../components/footer'
import { EventCard } from '../../components/event-card'
import { supabase } from '../../lib/supabaseClient'
import axiosInstance from '../../lib/axiosInstance'
import { Search, SlidersHorizontal, Ticket, MapPin, Calendar, Flame, RotateCcw } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Separator } from '../../components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryParam = searchParams.get('q') || ''
  const cityParam = searchParams.get('city') || 'all'
  const categoryParam = searchParams.get('cat') || 'all'
  const statusParam = searchParams.get('status') || 'all'
  const hotParam = searchParams.get('hot') === 'true'
  
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(queryParam)
  
  // Dynamic filter options from DB
  const [dbCategories, setDbCategories] = useState([])
  const [dbLocations, setDbLocations] = useState([])
  
  // Local states for filters
  const [selectedCategory, setSelectedCategory] = useState(categoryParam)
  const [selectedCity, setSelectedCity] = useState(cityParam)
  const [selectedStatus, setSelectedStatus] = useState(statusParam)
  const [isHot, setIsHot] = useState(hotParam)

  // Fetch dynamic categories and locations
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

  useEffect(() => {
    async function fetchResults() {
      setLoading(true)
      try {
        let supabaseQuery = supabase
          .from('events')
          .select('*')
          .eq('status', 'published') // Chỉ lấy sự kiện đã đăng

        // 1. Keyword Search
        if (queryParam) {
          supabaseQuery = supabaseQuery.or(`name.ilike.%${queryParam}%,description.ilike.%${queryParam}%,location.ilike.%${queryParam}%,category.ilike.%${queryParam}%`)
        }

        // 2. City Filter
        if (selectedCity !== 'all') {
          supabaseQuery = supabaseQuery.ilike('location', `%${selectedCity}%`)
        }

        // 3. Category Filter
        if (selectedCategory !== 'all') {
          supabaseQuery = supabaseQuery.eq('category', selectedCategory)
        }

        // 4. Hot/Featured Filter
        if (isHot) {
          supabaseQuery = supabaseQuery.eq('is_featured', true)
        }

        // 5. Status Filter
        if (selectedStatus !== 'all') {
          const now = new Date()
          const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString()
          const todayEnd = new Date(now.setHours(23, 59, 59, 999)).toISOString()

          if (selectedStatus === 'ongoing') {
            supabaseQuery = supabaseQuery.gte('date', todayStart).lte('date', todayEnd)
          } else if (selectedStatus === 'upcoming') {
            supabaseQuery = supabaseQuery.gt('date', todayEnd)
          } else if (selectedStatus === 'ended') {
            supabaseQuery = supabaseQuery.or(`status.eq.ended,date.lt.${todayStart}`)
          }
        }

        const { data, error } = await supabaseQuery.order('date', { ascending: true })

        if (error) throw error

        const mappedResults = (data || []).map(event => {
          const eventDate = new Date(event.date)
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
            soldOut: event.status === 'ended' || new Date(event.date) < new Date(),
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
  }, [queryParam, selectedCity, selectedCategory, selectedStatus, isHot])

  useEffect(() => {
    // Sync search params with local state
    const params = {}
    if (queryParam) params.q = queryParam
    if (selectedCity !== 'all') params.city = selectedCity
    if (selectedCategory !== 'all') params.cat = selectedCategory
    if (selectedStatus !== 'all') params.status = selectedStatus
    if (isHot) params.hot = 'true'
    setSearchParams(params)
  }, [selectedCity, selectedCategory, selectedStatus, isHot])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (searchInput.trim()) {
      params.set('q', searchInput.trim())
    } else {
      params.delete('q')
    }
    setSearchParams(params)
  }

  const clearFilters = () => {
    setSelectedCategory('all')
    setSelectedCity('all')
    setSelectedStatus('all')
    setIsHot(false)
    setSearchInput('')
    setSearchParams({})
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Sticky Search Bar */}
      <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-4 max-w-4xl mx-auto">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên sự kiện, nghệ sĩ, hoặc địa điểm..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
              />
            </div>
            <Button type="submit" className="rounded-2xl px-8 bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20">
              Tìm kiếm
            </Button>
          </form>
        </div>
      </div>
      
      <main className="flex-1 pb-12">
        <div className="container mx-auto px-4 mt-8">
          {/* Search Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex flex-wrap items-center gap-3">
                <Search className="w-8 h-8 text-primary" />
                {queryParam ? (
                  <>Kết quả cho: <span className="text-primary italic">"{queryParam}"</span></>
                ) : (
                  <>Khám phá sự kiện</>
                )}
              </h1>
              <p className="text-muted-foreground mt-2">
                Tìm thấy <span className="font-bold text-foreground">{results.length}</span> sự kiện phù hợp
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant={isHot ? "default" : "outline"} 
                className={`rounded-full gap-2 transition-all ${isHot ? 'bg-orange-600 hover:bg-orange-700 border-none' : ''}`}
                onClick={() => setIsHot(!isHot)}
              >
                <Flame className={`w-4 h-4 ${isHot ? 'fill-current' : 'text-orange-500'}`} />
                Sự kiện HOT
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-primary gap-1"
                onClick={clearFilters}
              >
                <RotateCcw className="w-3 h-3" />
                Làm mới
              </Button>
            </div>
          </div>

          <Separator className="mb-8" />

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-64 shrink-0">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24 space-y-8">
                <div className="flex items-center gap-2 font-bold text-lg mb-2">
                  <SlidersHorizontal className="w-5 h-5 text-primary" />
                  Bộ lọc
                </div>
                
                {/* Category Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-bold flex items-center gap-2 px-1">
                    <Ticket className="w-4 h-4 text-primary" />
                    Thể loại
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full bg-background rounded-xl">
                      <SelectValue placeholder="Chọn thể loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả thể loại</SelectItem>
                      {dbCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* City Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-bold flex items-center gap-2 px-1">
                    <MapPin className="w-4 h-4 text-primary" />
                    Thành phố
                  </label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="w-full bg-background rounded-xl">
                      <SelectValue placeholder="Chọn thành phố" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả địa điểm</SelectItem>
                      {dbLocations.map(loc => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-bold flex items-center gap-2 px-1">
                    <Ticket className="w-4 h-4 text-primary" />
                    Trạng thái
                  </label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full bg-background rounded-xl">
                      <SelectValue placeholder="Chọn trạng thái" />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-2xl" />
                  ))}
                </div>
              ) : results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {results.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-card border border-dashed border-border rounded-[2.5rem]">
                  <div className="w-20 h-20 bg-muted flex items-center justify-center rounded-full mx-auto mb-6 text-muted-foreground/30">
                    <Ticket className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Không tìm thấy sự kiện nào</h3>
                  <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
                    Chúng tôi không tìm thấy kết quả nào phù hợp với bộ lọc hiện tại. Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm nhé!
                  </p>
                  <Button 
                    className="mt-8 rounded-full px-8" 
                    onClick={clearFilters}
                  >
                    Xóa tất cả bộ lọc
                  </Button>
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

export default SearchPage

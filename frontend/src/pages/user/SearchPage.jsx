import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Header } from '../../components/header'
import { Footer } from '../../components/footer'
import { EventCard } from '../../components/event-card'
import { supabase } from '../../lib/supabaseClient'
import { Search, SlidersHorizontal, Ticket, MapPin, Calendar, Flame, RotateCcw } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Separator } from '../../components/ui/separator'

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const cityParam = searchParams.get('city') || 'all'
  const categoryParam = searchParams.get('cat') || 'all'
  const dateParam = searchParams.get('date') || 'all'
  const hotParam = searchParams.get('hot') === 'true'
  
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Local states for filters to make UI responsive
  const [selectedCategory, setSelectedCategory] = useState(categoryParam)
  const [selectedCity, setSelectedCity] = useState(cityParam)
  const [selectedDate, setSelectedDate] = useState(dateParam)
  const [isHot, setIsHot] = useState(hotParam)

  useEffect(() => {
    async function fetchResults() {
      setLoading(true)
      try {
        let supabaseQuery = supabase
          .from('events')
          .select('*')

        // 1. Keyword Search
        if (query) {
          supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%,category.ilike.%${query}%`)
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

        // 5. Date Filter
        if (selectedDate !== 'all') {
          const now = new Date()
          if (selectedDate === 'today') {
            const endOfDay = new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
            supabaseQuery = supabaseQuery.gte('date', new Date().toISOString()).lte('date', endOfDay)
          } else if (selectedDate === 'week') {
            const nextWeek = new Date(new Date().setDate(now.getDate() + 7)).toISOString()
            supabaseQuery = supabaseQuery.gte('date', new Date().toISOString()).lte('date', nextWeek)
          } else if (selectedDate === 'month') {
            const nextMonth = new Date(new Date().setMonth(now.getMonth() + 1)).toISOString()
            supabaseQuery = supabaseQuery.gte('date', new Date().toISOString()).lte('date', nextMonth)
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
  }, [query, selectedCity, selectedCategory, selectedDate, isHot])

  const clearFilters = () => {
    setSelectedCategory('all')
    setSelectedCity('all')
    setSelectedDate('all')
    setIsHot(false)
  }

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'Âm nhạc', label: 'Âm nhạc' },
    { id: 'Kịch/Hài', label: 'Kịch/Hài' },
    { id: 'Thể thao', label: 'Thể thao' },
    { id: 'Festival', label: 'Festival' },
    { id: 'Workshop', label: 'Workshop' },
  ]

  const cities = [
    { id: 'all', label: 'Tất cả thành phố' },
    { id: 'Hà Nội', label: 'Hà Nội' },
    { id: 'TP. Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
    { id: 'Đà Nẵng', label: 'Đà Nẵng' },
  ]

  const dateFilters = [
    { id: 'all', label: 'Mọi lúc' },
    { id: 'today', label: 'Hôm nay' },
    { id: 'week', label: 'Tuần này' },
    { id: 'month', label: 'Tháng này' },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold flex flex-wrap items-center gap-3">
              <Search className="w-8 h-8 text-primary" />
              {query ? (
                <>Kết quả tìm kiếm cho: <span className="text-primary">"{query}"</span></>
              ) : (
                <>Tất cả sự kiện</>
              )}
              {cityParam && cityParam !== 'Tất cả' && (
                <span className="text-sm bg-secondary px-3 py-1 rounded-full font-normal">tại {cityParam}</span>
              )}
            </h1>
            <p className="text-muted-foreground mt-2">
              Tìm thấy {results.length} sự kiện phù hợp
            </p>
          </div>

          {/* Filters & Content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-72 space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 font-bold text-lg">
                    <SlidersHorizontal className="w-5 h-5 text-primary" />
                    Bộ lọc
                  </div>
                  {(selectedCategory !== 'all' || selectedCity !== 'all' || selectedDate !== 'all' || isHot) && (
                    <button 
                      onClick={clearFilters}
                      className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Xóa hết
                    </button>
                  )}
                </div>
                
                <div className="space-y-8">
                  {/* Hot Filter */}
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-xl cursor-pointer transition-all hover:shadow-md"
                       onClick={() => setIsHot(!isHot)}>
                    <div className="flex items-center gap-2">
                      <Flame className={`w-5 h-5 ${isHot ? 'text-orange-600 fill-orange-600' : 'text-orange-400'}`} />
                      <span className={`text-sm font-bold ${isHot ? 'text-orange-700' : 'text-muted-foreground'}`}>Sự kiện HOT</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${isHot ? 'bg-orange-500' : 'bg-slate-200'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isHot ? 'left-6' : 'left-1'}`} />
                    </div>
                  </div>

                  <Separator />

                  {/* Category Filter */}
                  <div>
                    <p className="text-sm font-bold mb-4 flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-primary" />
                      Thể loại
                    </p>
                    <div className="flex flex-wrap lg:flex-col gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`text-left px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            selectedCategory === cat.id 
                              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]' 
                              : 'hover:bg-secondary text-muted-foreground'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* City Filter */}
                  <div>
                    <p className="text-sm font-bold mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      Thành phố
                    </p>
                    <div className="flex flex-wrap lg:flex-col gap-2">
                      {cities.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedCity(c.id)}
                          className={`text-left px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            selectedCity === c.id 
                              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]' 
                              : 'hover:bg-secondary text-muted-foreground'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Date Filter */}
                  <div>
                    <p className="text-sm font-bold mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Thời gian
                    </p>
                    <div className="flex flex-wrap lg:flex-col gap-2">
                      {dateFilters.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => setSelectedDate(d.id)}
                          className={`text-left px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            selectedDate === d.id 
                              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]' 
                              : 'hover:bg-secondary text-muted-foreground'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Results Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-2xl" />
                  ))}
                </div>
              ) : results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {results.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-card border border-dashed border-border rounded-3xl">
                  <Ticket className="w-16 h-16 mx-auto text-muted-foreground/20 mb-4" />
                  <h3 className="text-xl font-bold text-muted-foreground">Không tìm thấy sự kiện nào</h3>
                  <p className="text-muted-foreground mt-2">Hãy thử tìm kiếm với từ khóa khác nhé!</p>
                  <Button asChild className="mt-6" variant="outline">
                    <Link to="/su-kien">Xem tất cả sự kiện</Link>
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

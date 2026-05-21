"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ChevronDown, Menu, X, User, Ticket, LogOut, Search, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"
import { useDebounce } from "@/hooks/useDebounce"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const navLinks = [
  { label: "SỰ KIỆN", href: "/su-kien" },
  { label: "LỊCH DIỄN", href: "/lich-dien" },
  { label: "ĐỊA ĐIỂM", href: "/dia-diem" },
  { label: "HƯỚNG DẪN", href: "/huong-dan" },
  { label: "TIN TỨC", href: "/tin-tuc" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  
  const debouncedSearch = useDebounce(searchQuery, 300)
  const navigate = useNavigate()

  useEffect(() => {
    const raw = localStorage.getItem('user_info')
    if (raw) {
      try {
        setUser(JSON.parse(raw))
      } catch {
        setUser(null)
      }
    }
  }, [])

  useEffect(() => {
    async function performSearch() {
      if (!debouncedSearch || debouncedSearch.length < 2) {
        setSearchResults([])
        setShowResults(false)
        return
      }

      setIsSearching(true)
      try {
        const { data, error } = await supabase
          .from('events')
          .select('id, name, image_url, location, date')
          .or(`name.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%,location.ilike.%${debouncedSearch}%`)
          .limit(5)

        if (error) throw error
        setSearchResults(data || [])
        setShowResults(true)
      } catch (err) {
        console.error("Search error:", err)
      } finally {
        setIsSearching(false)
      }
    }

    performSearch()
  }, [debouncedSearch])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowResults(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user_token')
    localStorage.removeItem('user_info')
    setUser(null)
    navigate('/')
    window.location.reload()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-50/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-sky-300 rounded-lg flex items-center justify-center">
              <Ticket className="w-5 h-5 text-sky-900" />
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-xl text-foreground">TicketRush</span>
              <p className="text-xs font-medium text-muted-foreground -mt-1">Vé điện tử trực tuyến</p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sự kiện, nghệ sĩ, địa điểm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                  className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              {/* Quick Search Results Dropdown */}
              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-[100]">
                  <div className="p-2">
                    {isSearching ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">Đang tìm kiếm...</div>
                    ) : searchResults.length > 0 ? (
                      <>
                        <p className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kết quả nhanh</p>
                        {searchResults.map((event) => (
                          <button
                            key={event.id}
                            onClick={() => {
                              navigate(`/event/${event.id}`)
                              setShowResults(false)
                              setSearchQuery("")
                            }}
                            className="w-full flex items-center gap-3 p-2 hover:bg-secondary rounded-lg transition-colors text-left"
                          >
                            <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                              {event.image_url ? (
                                <img src={event.image_url} alt={event.name} className="w-full h-full object-cover" />
                              ) : (
                                <Ticket className="w-5 h-5 m-auto text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold truncate">{event.name}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{event.location}</p>
                            </div>
                          </button>
                        ))}
                        <button 
                          onClick={handleSearchSubmit}
                          className="w-full p-2 mt-2 text-center text-xs font-bold text-primary hover:bg-primary/5 rounded-lg border-t border-border"
                        >
                          Xem tất cả kết quả
                        </button>
                      </>
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">Không tìm thấy kết quả</div>
                    )}
                  </div>
                </div>
              )}
            </form>
            {showResults && <div className="fixed inset-0 z-[-1]" onClick={() => setShowResults(false)} />}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex h-16 items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="flex h-full items-center text-sm font-semibold text-foreground border-b-2 border-transparent hover:border-red-600 hover:text-red-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 h-16">
            <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" asChild>
              <Link to="/admin">
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 font-semibold text-foreground hover:bg-slate-200/50">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    {user.first_name || user.username}
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
                  <DropdownMenuItem className="cursor-pointer font-medium hover:bg-secondary" onClick={() => navigate('/profile')}>
                    Tài khoản
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer font-medium hover:bg-secondary" onClick={() => navigate('/my-tickets')}>
                    Vé của tôi
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer font-medium hover:bg-secondary text-red-600" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 font-semibold text-foreground hover:bg-orange-100 hover:text-orange-900 transition-colors" onClick={() => navigate('/login')}>
                  <User className="w-4 h-4" />
                  Đăng nhập
                </Button>
                <Button size="sm" className="hidden sm:flex font-semibold bg-red-600 hover:bg-red-700 text-white" onClick={() => navigate('/register')}>
                  Đăng ký
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border bg-slate-50/95">
            {/* Mobile Search */}
            <div className="px-4 mb-4">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-lg py-2 pl-10 pr-4 text-sm outline-none"
                />
              </form>
            </div>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-4 py-2 text-sm font-semibold text-foreground hover:text-red-600 hover:bg-secondary rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                /* HIỂN THỊ KHI ĐÃ ĐĂNG NHẬP */
                <div className="flex flex-col gap-2 px-4 pt-4 border-t border-border mt-2">
                  <div className="flex items-center gap-3 mb-2">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-muted-foreground">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-foreground">{user.first_name || user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full font-semibold" onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}>
                    Tài khoản
                  </Button>
                  <Button variant="outline" size="sm" className="w-full font-semibold text-red-600 border-red-200 hover:bg-red-50" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                    Đăng xuất
                  </Button>
                </div>
              ) : (
                /* HIỂN THỊ KHI CHƯA ĐĂNG NHẬP */
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 px-4 pt-4 border-t border-border mt-2">
                    <Button variant="outline" size="sm" className="flex-1 font-semibold hover:bg-orange-100 hover:text-orange-900 hover:border-orange-200 transition-colors" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>
                      Đăng nhập
                    </Button>
                    <Button size="sm" className="flex-1 font-semibold bg-red-600 hover:bg-red-700 text-white" onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}>
                      Đăng ký
                    </Button>
                  </div>
                  
                  {/* NÚT VÀO ADMIN - GIỮ LẠI TỪ NHÁNH ADMIN */}
                  <div className="px-4 py-2 border-t border-border mt-2">
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Shield className="w-4 h-4" />
                      Lối vào Admin
                    </Link>
                  </div>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
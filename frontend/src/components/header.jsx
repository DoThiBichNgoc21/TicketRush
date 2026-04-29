"use client"

import { useState } from "react"
import { Link } from "react-router"
import { ChevronDown, Menu, X, User, Ticket, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
            {/* Organizer Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden md:flex gap-2 font-semibold text-foreground hover:bg-slate-200/50 border-0">
                  <Building2 className="w-4 h-4" />
                  Nhà tổ chức
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
                <DropdownMenuItem className="cursor-pointer font-medium hover:bg-secondary">
                  Đăng ký tổ chức sự kiện
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer font-medium hover:bg-secondary">
                  Quản lý sự kiện
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer font-medium hover:bg-secondary">
                  Thiết lập sơ đồ ghế
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer font-medium hover:bg-secondary">
                  Báo cáo doanh thu
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 font-semibold text-foreground hover:bg-orange-100 hover:text-orange-900 transition-colors">
              <User className="w-4 h-4" />
              Đăng nhập
            </Button>
            <Button size="sm" className="hidden sm:flex font-semibold bg-red-600 hover:bg-red-700 text-white">
              Đăng ký
            </Button>

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
              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Dành cho nhà tổ chức</p>
                <Link
                  to="/organizer"
                  className="block px-4 py-2 text-sm font-semibold text-foreground hover:text-red-600 hover:bg-secondary rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng ký tổ chức sự kiện
                </Link>
              </div>
              <div className="flex gap-2 px-4 pt-4 border-t border-border mt-2">
                <Button variant="outline" size="sm" className="flex-1 font-semibold hover:bg-orange-100 hover:text-orange-900 hover:border-orange-200 transition-colors">
                  Đăng nhập
                </Button>
                <Button size="sm" className="flex-1 font-semibold bg-red-600 hover:bg-red-700 text-white">
                  Đăng ký
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

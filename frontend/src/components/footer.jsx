import { Link } from "react-router"
import { Phone, Mail, Share2, Video, Camera, Ticket, Building2, MapPin } from "lucide-react"

const footerLinks = {
  "Về chúng tôi": [
    { label: "Giới thiệu", href: "/gioi-thieu" },
    { label: "Liên hệ", href: "/lien-he" },
    { label: "Tuyển dụng", href: "/tuyen-dung" },
    { label: "Blog", href: "/blog" },
  ],
  "Dành cho người mua": [
    { label: "Hướng dẫn đặt vé", href: "/huong-dan-dat-ve" },
    { label: "Phương thức thanh toán", href: "/thanh-toan" },
    { label: "Chính sách hoàn vé", href: "/chinh-sach-hoan-ve" },
    { label: "FAQ", href: "/faq" },
  ],
  "Dành cho nhà tổ chức": [
    { label: "Đăng ký tổ chức sự kiện", href: "/organizer/register" },
    { label: "Quản lý sự kiện", href: "/organizer/dashboard" },
    { label: "Thiết lập sơ đồ ghế", href: "/organizer/seating" },
    { label: "Báo cáo doanh thu", href: "/organizer/reports" },
  ],
  "Pháp lý": [
    { label: "Điều khoản sử dụng", href: "/dieu-khoan" },
    { label: "Chính sách bảo mật", href: "/bao-mat" },
    { label: "Quyền riêng tư", href: "/quyen-rieng-tu" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-red-600/30 via-orange-300/20 to-red-600/30">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-foreground mb-2">Bạn là nhà tổ chức sự kiện?</h3>
              <p className="text-muted-foreground">Đăng ký ngay để bắt đầu bán vé trên nền tảng của chúng tôi</p>
            </div>
            <div className="flex gap-4">
              <Link
                to="/organizer/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                <Building2 className="w-5 h-5" />
                Đăng ký ngay
              </Link>
              <Link
                to="/organizer/demo"
                className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-foreground font-semibold rounded-lg hover:bg-secondary/80 transition-colors"
              >
                Xem demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Logo and Company Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-sky-300 rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-sky-900" />
              </div>
              <div>
                <span className="font-bold text-xl text-foreground">TicketRush</span>
                <p className="text-xs text-muted-foreground -mt-1">Vé điện tử trực tuyến</p>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Nền tảng phân phối vé điện tử hàng đầu Việt Nam, hỗ trợ tổ chức sự kiện âm nhạc và giải trí chuyên nghiệp.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Tầng 10, Tòa nhà ABC, Quận Cầu Giấy, Hà Nội</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                <span>Hotline: 1900 1234 56</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <span>support@ticketrush.vn</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Facebook"
              >
                <Share2 className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Youtube"
              >
                <Video className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <Camera className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-foreground mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-red-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* App Download */}
        <div className="mt-10 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Tải ứng dụng TicketRush</h4>
              <p className="text-sm text-muted-foreground">Đặt vé nhanh hơn, nhận nhiều ưu đãi hơn</p>
            </div>
            <div className="flex gap-3">
              <a
                href="#"
                className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.523 15.3414C17.5156 14.1184 17.9635 12.9534 18.7755 12.0514C19.5875 11.1494 20.7005 10.5774 21.9175 10.4534C21.5095 9.60137 20.9025 8.85937 20.1475 8.29137C19.3925 7.72337 18.5115 7.34637 17.5755 7.19037C16.6395 7.03437 15.6785 7.10337 14.7755 7.39137C13.8725 7.67937 13.0535 8.17737 12.3875 8.84237C11.7215 9.50737 11.2275 10.3194 10.9455 11.2144C10.6635 12.1094 10.6025 13.0614 10.7675 13.9884C10.9325 14.9154 11.3185 15.7874 11.8945 16.5314C12.4705 17.2754 13.2195 17.8694 14.0755 18.2634C14.9315 18.6574 15.8695 18.8394 16.8115 18.7934C17.7535 18.7474 18.6695 18.4744 19.4835 17.9984C20.2975 17.5224 20.9855 16.8584 21.4895 16.0614C21.9935 15.2644 22.2985 14.3584 22.3775 13.4194C21.1115 13.5384 19.9445 14.1014 19.0715 15.0034C18.1985 15.9054 17.6725 17.0854 17.5915 18.3414" />
                </svg>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Tải về trên</p>
                  <p className="text-sm font-medium text-foreground">App Store</p>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186c-.181-.085-.309-.273-.309-.492V2.306c0-.22.128-.407.309-.492zM14.5 12.707l2.302 2.302-8.074 4.652 5.772-6.954zm3.01-1.414l2.574 1.484c.346.2.557.57.557.969s-.21.77-.557.97l-2.574 1.483-2.656-2.656 2.656-2.25zm-3.01-.586L8.728 3.753l8.074 4.652-2.302 2.302z" />
                </svg>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Tải về trên</p>
                  <p className="text-sm font-medium text-foreground">Google Play</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-secondary/50 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; 2026 TicketRush. All rights reserved. | Nền tảng phân phối vé điện tử
        </div>
      </div>
    </footer>
  )
}

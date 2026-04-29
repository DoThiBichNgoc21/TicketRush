import { Link } from "react-router"
import { Phone, Mail, Share2, Video, Camera, Ticket, MapPin } from "lucide-react"

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

  "Pháp lý": [
    { label: "Điều khoản sử dụng", href: "/dieu-khoan" },
    { label: "Chính sách bảo mật", href: "/bao-mat" },
    { label: "Quyền riêng tư", href: "/quyen-rieng-tu" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">


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

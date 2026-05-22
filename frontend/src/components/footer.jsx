import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
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
  const [contactData, setContactData] = useState({
    hotline: "1900 1234 56",
    support_email: "support@ticketrush.vn",
    office_address: "Tầng 10, Tòa nhà ABC, Quận Cầu Giấy, Hà Nội",
    facebook_page: "#",
    instagram_page: "#",
    zalo_oa_id: "#",
  });

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const response = await fetch(`${API_BASE_URL}/api/admin/support/articles/contact`);
        const result = await response.json();
        if (response.ok && result.data && result.data.id) {
          setContactData({
            hotline: result.data.hotline || contactData.hotline,
            support_email: result.data.support_email || contactData.support_email,
            office_address: result.data.office_address || contactData.office_address,
            facebook_page: result.data.facebook_page || "#",
            instagram_page: result.data.instagram_page || "#",
            zalo_oa_id: result.data.zalo_oa_id || "#",
          });
        }
      } catch (error) {
        console.error("Failed to fetch contact data:", error);
      }
    };
    fetchContactData();
  }, []);

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
                <span>{contactData.office_address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                <span>Hotline: {contactData.hotline}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <span>{contactData.support_email}</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              <a
                href={contactData.facebook_page}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Facebook"
              >
                <Share2 className="w-5 h-5" />
              </a>
              <a
                href={contactData.zalo_oa_id}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Zalo"
              >
                <Video className="w-5 h-5" />
              </a>
              <a
                href={contactData.instagram_page}
                target="_blank"
                rel="noopener noreferrer"
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
"use client"

import { ArrowRight, Percent, Gift, Star, Users, Zap, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    id: 1,
    title: "Đặt vé nhanh chóng",
    description: "Chọn ghế, thanh toán và nhận vé điện tử chỉ trong vài phút",
    icon: Zap,
    color: "from-orange-500 to-red-500",
  },
  {
    id: 2,
    title: "Sơ đồ ghế trực quan",
    description: "Xem và chọn vị trí ngồi yêu thích trên sơ đồ 3D chi tiết",
    icon: Users,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 3,
    title: "Bảo mật tuyệt đối",
    description: "Thông tin cá nhân và thanh toán được bảo vệ an toàn 100%",
    icon: Shield,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: 4,
    title: "Ưu đãi hấp dẫn",
    description: "Nhận ngay giảm giá khi đăng ký thành viên và đặt vé lần đầu",
    icon: Gift,
    color: "from-pink-500 to-rose-500",
  },
]

const promos = [
  {
    id: 1,
    title: "Giảm 20% lần đầu",
    description: "Đăng ký thành viên và nhận ngay mã giảm 20% cho đơn đặt vé đầu tiên",
    icon: Percent,
    color: "from-orange-500 to-red-500",
  },
  {
    id: 2,
    title: "Mua nhóm giảm giá",
    description: "Mua từ 5 vé trở lên được giảm 10% tổng giá trị đơn hàng",
    icon: Users,
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: 3,
    title: "Thành viên VIP",
    description: "Tích điểm đổi vé miễn phí và nhận nhiều ưu đãi độc quyền",
    icon: Star,
    color: "from-yellow-500 to-amber-500",
  },
]

export function PromoSection() {
  return (
    <section className="py-16 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-3">
            Tại sao chọn TicketRush?
          </h2>
          <p className="text-muted-foreground text-lg italic">
            Nền tảng đặt vé điện tử hàng đầu Việt Nam
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.id}
                className="group text-center p-8 bg-card border border-border rounded-3xl hover:shadow-2xl hover:border-primary/20 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 group-hover:rotate-6 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
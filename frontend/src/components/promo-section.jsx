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
    <>
      {/* Features Section */}
      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Tại sao chọn TicketRush?</h2>
            <p className="text-muted-foreground">Nền tảng đặt vé điện tử hàng đầu Việt Nam</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.id}
                  className="text-center p-6"
                >
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Promos Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Ưu đãi đặc biệt
              </h2>
              <p className="text-muted-foreground mt-1">Các chương trình khuyến mãi dành cho bạn</p>
            </div>
            <Button variant="ghost" className="text-primary hover:text-primary/80 gap-2 hidden sm:flex">
              Xem tất cả
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {promos.map((promo) => {
              const Icon = promo.icon
              return (
                <div
                  key={promo.id}
                  className="group relative bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${promo.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${promo.color} mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {promo.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {promo.description}
                  </p>

                  {/* Arrow */}
                  <ArrowRight className="absolute bottom-6 right-6 w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all duration-300 transform group-hover:translate-x-1" />
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}

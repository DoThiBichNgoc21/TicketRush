import React from 'react'
import { Header } from '../components/header'
import { HeroBanner } from '../components/hero-banner'
import { QuickBooking } from '../components/quick-booking'
import { EventSection } from '../components/event-section'
import { PromoSection } from '../components/promo-section'
import { Footer } from '../components/footer'

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <HeroBanner />
        <QuickBooking />
        <EventSection />
        <PromoSection />
      </main>
      <Footer />
    </div>
  )
}

export default HomePage

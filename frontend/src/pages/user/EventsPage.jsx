import React from 'react'
import { Header } from '../../components/header'
import { EventSection } from '../../components/event-section'
import { Footer } from '../../components/footer'

const UserEventsPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Tất cả sự kiện</h1>
          <p className="text-muted-foreground mb-8">
            Tìm kiếm và khám phá các sự kiện âm nhạc, giải trí và văn hóa đang diễn ra.
          </p>
        </div>
        <EventSection />
      </main>
      <Footer />
    </div>
  )
}

export default UserEventsPage

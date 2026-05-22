"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { EventCard } from "./event-card"
import { supabase } from "../lib/supabaseClient"

export function EventSection() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("upcoming")
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const tabs = [
    { id: "all", label: "TẤT CẢ" },
    { id: "ongoing", label: "ĐANG DIỄN RA" },
    { id: "upcoming", label: "SẮP DIỄN RA" },
    { id: "ended", label: "ĐÃ KẾT THÚC" },
  ]

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true)
      try {
        console.log('Fetching events for tab:', activeTab);
        let query = supabase
          .from('events')
          .select('*')
          .in('status', ['published', 'ended'])

        // Nới lỏng điều kiện lọc để hiển thị được nhiều sự kiện hơn khi đang phát triển
        const now = new Date();
        const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        const todayEnd = new Date(now.setHours(23, 59, 59, 999)).toISOString();

        if (activeTab === "ongoing") {
          query = query.gte('date', todayStart).lte('date', todayEnd);
        } else if (activeTab === "upcoming") {
          query = query.gt('date', todayEnd);
        } else if (activeTab === "ended") {
          query = query.or(`status.eq.ended,date.lt.${todayStart}`);
        }

        const { data, error } = await query.order('date', { ascending: true })

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Data received from Supabase:', data);

        if (!data || data.length === 0) {
          setEvents([])
          return
        }

        const mappedEvents = data.map(event => {
          const eventDate = new Date(event.date)
          return {
            id: event.id,
            title: event.name,
            date: eventDate.toLocaleDateString('vi-VN'),
            time: eventDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            location: event.location,
            category: event.category,
            price: "Liên hệ", // Price not in table yet
            poster: event.image_url ? `url(${event.image_url})` : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            isHot: event.is_featured,
            soldOut: event.status === 'ended' || new Date(event.date) < new Date(),
          }
        })

        setEvents(mappedEvents)
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [activeTab])

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Sự kiện nổi bật</h2>
          <p className="text-muted-foreground">Khám phá các sự kiện âm nhạc và giải trí hấp dẫn nhất</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all ${activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Events Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {events.length > 0 ? (
                events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  Không có sự kiện nào trong mục này.
                </div>
              )}
            </div>
          </>
        )}

        {/* View All Button */}
        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            size="lg" 
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => navigate('/su-kien')}
          >
            Xem tất cả sự kiện
          </Button>
        </div>
      </div>
    </section>
  )
}
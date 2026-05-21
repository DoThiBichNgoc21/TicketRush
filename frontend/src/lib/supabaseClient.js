import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured =
  Boolean(supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey)

// Prevent crash if URL is missing or invalid
let supabaseClient;
try {
  if (isSupabaseConfigured) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  } else {
    console.error(
      '[TicketRush] Thiếu VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ' +
        'Tạo file frontend/.env (xem .env.example) rồi chạy lại npm run dev.'
    )
    supabaseClient = {
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({ data: [], error: null }),
            single: () => Promise.resolve({ data: null, error: { message: 'Supabase chưa cấu hình' } }),
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
          order: () => Promise.resolve({ data: [], error: null }),
          single: () => Promise.resolve({ data: null, error: { message: 'Supabase chưa cấu hình' } }),
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: { message: 'Supabase chưa cấu hình' } }),
          }),
        }),
        update: () => ({
          eq: () => Promise.resolve({ error: { message: 'Supabase chưa cấu hình' } }),
        }),
      }),
    }
  }
} catch (e) {
  console.error('Failed to initialize Supabase client:', e)
  supabaseClient = {}
}

export const supabase = supabaseClient

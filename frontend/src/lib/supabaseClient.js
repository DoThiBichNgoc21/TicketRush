import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Prevent crash if URL is missing or invalid
let supabaseClient;
try {
  if (supabaseUrl && supabaseUrl.startsWith('http')) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  } else {
    console.warn('Invalid or missing Supabase URL')
    supabaseClient = {
      from: () => ({
        select: () => ({
          eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
          order: () => Promise.resolve({ data: [], error: null })
        })
      })
    }
  }
} catch (e) {
  console.error('Failed to initialize Supabase client:', e)
  supabaseClient = {}
}

export const supabase = supabaseClient

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Task = {
  id: string
  title: string
  description?: string
  completed: boolean
  user_email: string
  created_at: string
  updated_at: string
  estimated_pomodoros: number
  completed_pomodoros: number
}

export type User = {
  id: string
  email: string
  name: string
  created_at: string
}

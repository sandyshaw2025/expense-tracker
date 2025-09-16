import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: number
          user_id: string
          date: string
          amount: number
          type: 'income' | 'expense'
          category: string
          description: string
          entity: string
          payment_method: string | null
          payment_details: string | null
          account_used: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id?: string
          date: string
          amount: number
          type: 'income' | 'expense'
          category: string
          description: string
          entity: string
          payment_method?: string | null
          payment_details?: string | null
          account_used?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          date?: string
          amount?: number
          type?: 'income' | 'expense'
          category?: string
          description?: string
          entity?: string
          payment_method?: string | null
          payment_details?: string | null
          account_used?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
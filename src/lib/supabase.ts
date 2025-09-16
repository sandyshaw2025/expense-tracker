import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://suvrklvmephiccuhgkag.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1dnJrbHZtZXBoaWNjdWhna2FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5ODU2ODcsImV4cCI6MjA3MzU2MTY4N30.xD86eADovtguD4EgCsdg2zLyk57ii_yaZJJFA2Ft1To'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

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
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser client (for client components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server/admin client (for API routes)
export const supabaseAdmin = typeof window === 'undefined'
  ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  : (null as any)

export type Roast = {
  id: string
  url: string
  target_customer: string | null
  desired_action: string | null
  scraped_content: string | null
  ai_result: RoastResult | null
  score: number | null
  email: string | null
  is_paid: boolean
  payment_id: string | null
  created_at: string
}

export type RoastResult = {
  score: number
  top_3_problems: string[]
  full_roast: {
    area: string
    problem: string
    fix: string
  }[]
  rewrite: {
    headline: string
    subheadline: string
    benefits: string[]
    cta_text: string
  }
  quick_fixes: string[]
}

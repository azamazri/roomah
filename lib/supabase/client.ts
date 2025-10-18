import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

/**
 * Create a Supabase client for use in the browser/client components
 * This client respects RLS policies and uses the anon key
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Creates a Supabase client for client-side use in Next.js App Router
 * This properly handles cookies for authentication
 */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Export singleton instance for backwards compatibility
export const supabase = createClient()
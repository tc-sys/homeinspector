import { createBrowserClient } from '@supabase/ssr'

// Singleton to avoid re-creating the client on every render
let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // During SSR the browser client cannot be used — event handlers and effects
  // that call supabase methods only run on the client anyway.
  if (typeof window === 'undefined') {
    return {} as ReturnType<typeof createBrowserClient>
  }
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}

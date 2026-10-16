import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { isSupabaseConfigured } from './env';

export async function createClient() {
  const cookieStore = await cookies();

  const url = isSupabaseConfigured()
    ? (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)!
    : 'https://placeholder.supabase.co';

  const anonKey = isSupabaseConfigured()
    ? (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY)!
    : 'placeholder-anon-key';

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Can happen in Server Components; handled by middleware
        }
      },
    },
  });
}

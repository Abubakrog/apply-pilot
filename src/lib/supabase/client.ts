import { createBrowserClient } from '@supabase/ssr';
import { isSupabaseConfigured } from './env';

export function createClient() {
  if (!isSupabaseConfigured()) {
    // Return a dummy client or null if not configured to prevent crashes during preview
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
    );
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

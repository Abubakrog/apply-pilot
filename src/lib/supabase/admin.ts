import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from './env';

export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!isSupabaseConfigured() || !serviceRoleKey) {
    return null;
  }

  return createSupabaseClient(url!, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

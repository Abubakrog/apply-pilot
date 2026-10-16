export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  return Boolean(
    url &&
      anonKey &&
      !url.includes('your-project') &&
      !anonKey.includes('your-supabase-anon-key')
  );
}

export function isResendConfigured(): boolean {
  const key = process.env.RESEND_API_KEY;
  return Boolean(key && !key.includes('your_resend_api_key'));
}

export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && !key.includes('your-gemini-api-key'));
}

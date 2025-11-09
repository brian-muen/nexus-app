/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Read from Vite env - these should be set in .env or the system for real integration.
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

const DEFAULT_EMAIL_REDIRECT =
  typeof window !== 'undefined' ? `${window.location.origin}/oauth-callback.html` : undefined;

export const SUPABASE_EMAIL_REDIRECT_TO =
  (import.meta.env.VITE_SUPABASE_EMAIL_REDIRECT_TO as string | undefined) || DEFAULT_EMAIL_REDIRECT;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn('[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Supabase features will be disabled.');
}

let client: SupabaseClient;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  client = createClient('https://localhost.invalid', 'public-anon-key');
}

export const supabase = client;

export default supabase;
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

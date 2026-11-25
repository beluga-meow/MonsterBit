import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const isConfigured = Boolean(url && anonKey && !url.includes('YOUR_'));
export const supabase = isConfigured
  ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null;

if (!isConfigured) console.warn('MonsterBit: configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');

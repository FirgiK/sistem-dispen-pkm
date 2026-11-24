import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseURL = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Mengecek apakah kredensial Supabase sudah dikonfigurasi di .env
 */
export const isSupabaseConfigured = Boolean(
  supabaseURL &&
  supabaseAnonKey &&
  supabaseURL !== 'your_supabase_url' &&
  supabaseAnonKey !== 'your_supabase_anon_key' &&
  typeof supabaseURL === 'string' &&
  supabaseURL.startsWith('http')
);

/**
 * Supabase client yang aman:
 * Jika .env belum diisi, client bernilai null dan tidak membuat aplikasi crash.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseURL!, supabaseAnonKey!)
  : null;

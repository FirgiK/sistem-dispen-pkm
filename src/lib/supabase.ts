import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseURL = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseURL &&
  supabaseAnonKey &&
  supabaseURL !== "your_supabase_url" &&
  supabaseAnonKey !== "your_supabase_anon_key" &&
  typeof supabaseURL === "string" &&
  supabaseURL.startsWith("http"),
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseURL!, supabaseAnonKey!)
  : null;

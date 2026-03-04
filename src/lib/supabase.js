import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseReady =
  typeof supabaseUrl === "string" &&
  supabaseUrl.trim().length > 0 &&
  !supabaseUrl.startsWith("YOUR_") &&
  typeof supabaseAnonKey === "string" &&
  supabaseAnonKey.trim().length > 0 &&
  !supabaseAnonKey.startsWith("YOUR_");

export const supabase = supabaseReady
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

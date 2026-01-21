import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// ✅ Prevent build crash
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase env vars missing. Check .env.local / Vercel env vars.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
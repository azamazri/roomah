// server/db/client.ts
import { createClient } from "@supabase/supabase-js";
import { CLIENT_ENV } from "@/lib/env/client";

export const supabase = createClient(
  CLIENT_ENV.NEXT_PUBLIC_SUPABASE_URL,
  CLIENT_ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

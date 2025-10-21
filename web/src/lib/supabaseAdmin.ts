import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Lazily create admin client to avoid build-time env errors
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Supabase admin env vars missing");
  }
  return createClient(url, serviceKey);
}

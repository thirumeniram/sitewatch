import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "../../config/config";

export function createSupabaseAuthClient(): SupabaseClient {
  return createClient(`${config.supabase.url}`, `${config.supabase.publishableKey}`, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

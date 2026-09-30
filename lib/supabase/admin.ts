import "server-only";
import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

let admin: SupabaseClient | null = null;

/**
 * Service-role client for trusted server code (Stripe webhook).
 * Bypasses Row Level Security — never import this from client components.
 */
export function createAdminClient(): SupabaseClient {
  if (!admin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
    admin = createSupabaseClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return admin;
}

// lib/supabase/admin.ts (SOLO SERVER — NUNCA en el cliente)
import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // <- no pública
  );
}

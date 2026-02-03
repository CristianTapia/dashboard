import "server-only";
import { createClient } from "@supabase/supabase-js";

export function createAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

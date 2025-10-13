// (SOLO SERVER — NUNCA EN EL CLIENTE)
import "server-only"; // Asegura que este archivo solo se use en el servidor
import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!; // <- no pública
  return createClient(url, key);
}

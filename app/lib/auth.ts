import "server-only";
import { createServer } from "@/app/lib/supabase/server";
import { isCurrentUserAdmin } from "@/app/lib/tenant";

export async function requireUser() {
  const supabase = await createServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Sesion no valida");
  return user;
}

export async function requireAdmin() {
  await requireUser();
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) throw new Error("Permisos insuficientes");
  return { ok: true };
}

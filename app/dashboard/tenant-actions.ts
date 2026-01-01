"use server";

import { cookies } from "next/headers";
import { createServer } from "@/app/lib/supabase/server";

/**
 * Cambia el tenant activo guardando la cookie `tenantId`.
 * Valida que el usuario tenga acceso a ese tenant.
 */
export async function setActiveTenantAction(tenantId: string) {
  const cookieStore = await cookies();
  const supabase = await createServer();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Sesión no válida");

  const { data: membership, error } = await supabase
    .from("tenant_members")
    .select("tenant_id")
    .eq("user_id", user.id)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!membership) throw new Error("No tienes acceso a este tenant");

  cookieStore.set("tenantId", tenantId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });

  return { ok: true };
}

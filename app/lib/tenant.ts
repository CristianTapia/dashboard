import "server-only";
import { cookies } from "next/headers";
import { createServer } from "@/app/lib/supabase/server";

/**
 * Obtiene el tenant activo desde la cookie `tenantId` y valida que el usuario
 * sea miembro. Si no hay cookie, toma el primer tenant del usuario.
 */
export async function getCurrentTenantId() {
  const cookieStore = await cookies();
  const tenantIdFromCookie = cookieStore.get("tenantId")?.value;

  const supabase = await createServer();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Sesión no válida");

  if (tenantIdFromCookie) {
    const { data: membership, error } = await supabase
      .from("tenant_members")
      .select("tenant_id")
      .eq("user_id", user.id)
      .eq("tenant_id", tenantIdFromCookie)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!membership) throw new Error("No tienes acceso a este tenant");
    return tenantIdFromCookie;
  }

  // Fallback: primer tenant del usuario
  const { data: membership, error } = await supabase
    .from("tenant_members")
    .select("tenant_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!membership) throw new Error("El usuario no tiene tenants asignados");
  return membership.tenant_id;
}

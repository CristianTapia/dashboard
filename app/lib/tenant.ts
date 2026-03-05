import "server-only";
import { cookies } from "next/headers";
import { createServer } from "@/app/lib/supabase/server";
import { createAdmin } from "@/app/lib/supabase";

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
  if (userError || !user) throw new Error("Sesion no valida");

  if (tenantIdFromCookie) {
    const { data: membership, error } = await supabase
      .from("tenant_members")
      .select("tenant_id")
      .eq("user_id", user.id)
      .eq("tenant_id", tenantIdFromCookie)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (membership) return tenantIdFromCookie;
  }

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

/**
 * Retorna true si el usuario tiene permisos globales.
 * Nota: "owner" se mantiene por compatibilidad temporal hasta migrar a solo admin/member.
 */
export async function isCurrentUserAdmin() {
  const supabase = await createServer();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Sesion no valida");

  const { data, error } = await supabase
    .from("tenant_members")
    .select("tenant_id")
    .eq("user_id", user.id)
    .in("role", ["admin", "owner"])
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return !!data;
}

/**
 * Resuelve el tenant objetivo para operaciones de escritura.
 * - admin puede elegir cualquier tenant valido.
 * - member siempre usa su tenant activo.
 */
export async function resolveWritableTenantId(requestedTenantId?: string) {
  const currentTenantId = await getCurrentTenantId();
  if (!requestedTenantId) return currentTenantId;

  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    if (requestedTenantId !== currentTenantId) {
      throw new Error("No tienes permisos para crear en ese tenant");
    }
    return currentTenantId;
  }

  const admin = createAdmin();
  const { data, error } = await admin.from("tenants").select("id").eq("id", requestedTenantId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Tenant invalido");
  return requestedTenantId;
}

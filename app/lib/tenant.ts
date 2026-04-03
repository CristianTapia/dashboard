import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";

import { createServer } from "@/app/lib/supabase/server";
import { createAdmin } from "@/app/lib/supabase";

type TenantMembership = {
  tenant_id: string;
  role: string | null;
  tenant: {
    id: string;
    name: string;
  } | null;
};

const getCurrentUserCached = cache(async () => {
  const supabase = await createServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Sesion no valida");
  }

  return user;
});

const getCurrentMembershipsCached = cache(async () => {
  const supabase = await createServer();
  const user = await getCurrentUserCached();

  const { data, error } = await supabase
    .from("tenant_members")
    .select("tenant_id, role, tenant:tenants(id,name)")
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Array<{
    tenant_id: string;
    role: string | null;
    tenant: { id: string; name: string } | { id: string; name: string }[] | null;
  }>;

  return rows.map((row) => {
    const tenantValue = Array.isArray(row.tenant) ? row.tenant[0] ?? null : row.tenant ?? null;

    return {
      tenant_id: row.tenant_id,
      role: row.role,
      tenant: tenantValue ? { id: tenantValue.id, name: tenantValue.name } : null,
    };
  });
});

const getTenantAccessContextCached = cache(async () => {
  const cookieStore = await cookies();
  const tenantIdFromCookie = cookieStore.get("tenantId")?.value ?? null;
  const memberships = await getCurrentMembershipsCached();

  if (memberships.length === 0) {
    throw new Error("El usuario no tiene tenants asignados");
  }

  const tenantIds = memberships.map((membership) => membership.tenant_id);
  const isAdmin = memberships.some((membership) => membership.role === "admin" || membership.role === "owner");
  const activeTenantId =
    tenantIdFromCookie && tenantIds.includes(tenantIdFromCookie) ? tenantIdFromCookie : memberships[0].tenant_id;

  return {
    isAdmin,
    activeTenantId,
    memberships,
  };
});

/**
 * Obtiene el tenant activo desde la cookie `tenantId` y valida que el usuario
 * sea miembro. Si no hay cookie, toma el primer tenant del usuario.
 */
export async function getCurrentTenantId() {
  const ctx = await getTenantAccessContextCached();
  return ctx.activeTenantId;
}

/**
 * Retorna true si el usuario tiene permisos globales.
 * Nota: "owner" se mantiene por compatibilidad temporal hasta migrar a solo admin/member.
 */
export async function isCurrentUserAdmin() {
  const ctx = await getTenantAccessContextCached();
  return ctx.isAdmin;
}

export async function getTenantAccessContext() {
  return getTenantAccessContextCached();
}

export async function getCurrentUser() {
  return getCurrentUserCached();
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

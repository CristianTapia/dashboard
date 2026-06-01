"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/app/lib/auth";
import { closeTableSession, createJoinedTableSession } from "@/app/lib/data/table-sessions";
import { getTenantAccessContext } from "@/app/lib/tenant";

export async function createJoinedTableSessionAction(tableIds: string[]) {
  await requireUser();

  const tenantCtx = await getTenantAccessContext();
  const tenantId = tenantCtx.activeTenantId;
  if (!tenantId) {
    throw new Error("No hay tenant activo");
  }

  if (tenantCtx.activeRole !== "tenant_admin" && tenantCtx.activeRole !== "staff") {
    throw new Error("Permisos insuficientes");
  }

  if (!Array.isArray(tableIds)) {
    throw new Error("Seleccion invalida");
  }

  const session = await createJoinedTableSession({ tenantId, tableIds });

  revalidatePath("/dashboard/unir-mesas");

  return { ok: true, session };
}

export async function closeJoinedTableSessionAction(sessionId: string) {
  await requireUser();

  const tenantCtx = await getTenantAccessContext();
  const tenantId = tenantCtx.activeTenantId;
  if (!tenantId) {
    throw new Error("No hay tenant activo");
  }

  if (tenantCtx.activeRole !== "tenant_admin" && tenantCtx.activeRole !== "staff") {
    throw new Error("Permisos insuficientes");
  }

  if (!sessionId?.trim()) {
    throw new Error("Sesion invalida");
  }

  const session = await closeTableSession({ tenantId, sessionId: sessionId.trim() });

  revalidatePath("/dashboard/unir-mesas");

  return { ok: true, session };
}

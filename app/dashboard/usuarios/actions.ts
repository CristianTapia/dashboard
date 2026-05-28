"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import {
  createTenantStaffUser,
  createUser,
  deleteTenantStaffUser,
  deleteUser,
  listTenantTeam,
  listUsers,
  updateTenantActive,
  updateTenantStaffAssignments,
  updateUser,
} from "@/app/lib/data/users";
import { CreateUserSchema, UpdateUserSchema } from "@/app/lib/validators/users";
import { requireAdmin } from "@/app/lib/auth";
import { getTenantAccessContext } from "@/app/lib/tenant";

export async function createUserAction(payload: unknown) {
  await requireAdmin();

  const parsed = CreateUserSchema.safeParse(payload);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos invalidos");

  const created = await createUser(parsed.data);
  revalidateTag("users");
  revalidateTag("tenants");
  return { ok: true, created };
}

export async function listUsersAction() {
  await requireAdmin();
  const users = await listUsers();
  revalidateTag("users");
  return { ok: true, users };
}

export async function deleteUserAction(id: string) {
  await requireAdmin();
  await deleteUser(id);
  revalidateTag("users");
  revalidateTag("tenants");
  return { ok: true };
}

export async function updateUserAction(
  id: string,
  payload: {
    tenantName?: string;
    tenantDomain?: string;
    tenantAddress?: string;
    tenantMapsUrl?: string;
    tenantMenuThemesEnabled?: boolean;
    tenantMenuTheme?: "default" | "summer" | "winter" | "halloween" | "christmas";
    loginName?: string;
    password?: string;
    role?: "admin" | "tenant_admin" | "staff" | "member";
    userId?: string;
  },
) {
  await requireAdmin();
  const parsed = UpdateUserSchema.safeParse(payload);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos invalidos");

  const updated = await updateUser(id, parsed.data);
  revalidateTag("users");
  revalidateTag("tenants");
  return { ok: true, updated };
}

export async function updateTenantActiveAction(id: string, active: boolean) {
  await requireAdmin();
  const updated = await updateTenantActive(id, active);
  revalidateTag("users");
  revalidateTag("tenants");
  return { ok: true, updated };
}

export async function createTenantStaffUserAction(payload: unknown) {
  const tenantCtx = await getTenantAccessContext();
  if (!tenantCtx.isTenantAdmin || tenantCtx.isAdmin) throw new Error("Permisos insuficientes");

  const schema = CreateUserSchema.pick({
    loginName: true,
    password: true,
  }).extend({
    name: z.string().trim().min(1, "El nombre es obligatorio").max(80, "El nombre es demasiado largo"),
    role: z.enum(["tenant_admin", "staff"]).optional(),
    salons: z.array(z.string().trim().min(1)).optional(),
    tableIds: z.array(z.string().trim().min(1)).optional(),
  });
  const parsed = schema.safeParse(payload);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos invalidos");

  const created = await createTenantStaffUser(parsed.data);
  revalidateTag("users");
  revalidatePath("/dashboard/usuarios");
  return { ok: true, created };
}

export async function updateTenantStaffAssignmentsAction(
  userId: string,
  payload: {
    name?: string;
    loginName?: string;
    password?: string;
    salons?: string[];
    tableIds?: string[];
    role?: "tenant_admin" | "staff";
  },
) {
  const tenantCtx = await getTenantAccessContext();
  if (!tenantCtx.isTenantAdmin || tenantCtx.isAdmin) throw new Error("Permisos insuficientes");

  const schema = z.object({
    name: z.string().trim().min(1, "El nombre es obligatorio").max(80, "El nombre es demasiado largo").optional(),
    loginName: CreateUserSchema.shape.loginName.optional(),
    password: CreateUserSchema.shape.password.optional().or(z.literal("")),
    role: z.enum(["tenant_admin", "staff"]).optional(),
    salons: z.array(z.string().trim().min(1)).optional(),
    tableIds: z.array(z.string().trim().min(1)).optional(),
  });
  const parsed = schema.safeParse(payload);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos invalidos");

  const updated = await updateTenantStaffAssignments(userId, {
    ...parsed.data,
    password: parsed.data.password || undefined,
  });
  revalidateTag("users");
  revalidatePath("/dashboard/usuarios");
  return { ok: true, updated };
}

export async function deleteTenantStaffUserAction(userId: string) {
  const tenantCtx = await getTenantAccessContext();
  if (!tenantCtx.isTenantAdmin || tenantCtx.isAdmin) throw new Error("Permisos insuficientes");

  await deleteTenantStaffUser(userId);
  revalidateTag("users");
  revalidatePath("/dashboard/usuarios");
  return { ok: true };
}

export async function listTenantTeamAction() {
  const tenantCtx = await getTenantAccessContext();
  if (!tenantCtx.isTenantAdmin || tenantCtx.isAdmin) throw new Error("Permisos insuficientes");
  const users = await listTenantTeam();
  return { ok: true, users };
}

"use server";

import { revalidateTag } from "next/cache";
import { createUser, listUsers, deleteUser, updateUser } from "@/app/lib/data/users";
import { CreateUserSchema, UpdateUserSchema } from "@/app/lib/validators/users";
import { requireAdmin } from "@/app/lib/auth";

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
  payload: { tenantName?: string; tenantDomain?: string; role?: "admin" | "member"; userId?: string },
) {
  await requireAdmin();
  const parsed = UpdateUserSchema.safeParse(payload);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos invalidos");

  const updated = await updateUser(id, parsed.data);
  revalidateTag("users");
  revalidateTag("tenants");
  return { ok: true, updated };
}

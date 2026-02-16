"use server";

import { revalidateTag } from "next/cache";
import { createServer } from "@/app/lib/supabase/server";
import { createUser, listUsers, deleteUser, updateUser } from "@/app/lib/data/users";
import { CreateUserSchema } from "@/app/lib/validators/users";

async function requireUser() {
  const supabase = await createServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Sesion no valida");
}

export async function createUserAction(payload: unknown) {
  await requireUser();

  const parsed = CreateUserSchema.safeParse(payload);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos invalidos");

  const created = await createUser(parsed.data);
  // refresca el listado
  revalidateTag("users");
  return { ok: true, created };
}

export async function listUsersAction() {
  await requireUser();
  const users = await listUsers();
  revalidateTag("users");
  return { ok: true, users };
}

export async function deleteUserAction(id: string) {
  await requireUser();
  await deleteUser(id);
  // refresca el listado
  revalidateTag("users");
  return { ok: true };
}

export async function updateUserAction(id: string, payload: { tenantName?: string }) {
  await requireUser();
  const updated = await updateUser(id, payload);
  revalidateTag("users");
  return { ok: true, updated };
}

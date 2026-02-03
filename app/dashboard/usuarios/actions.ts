"use server";

import { revalidateTag } from "next/cache";
import { createServer } from "@/app/lib/supabase/server";
import { createUser, listUsers, deleteUser, updateUser } from "@/app/lib/data/users";
import { CreateUserSchema } from "@/app/lib/validators/users";

export async function createUserAction(payload: unknown) {
  const supabase = await createServer();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Sesion no valida");

  const parsed = CreateUserSchema.safeParse(payload);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos invalidos");

  const created = await createUser(parsed.data);
  // refresca el listado
  revalidateTag("users");
  return { ok: true, created };
}

export async function listUsersAction() {
  const users = await listUsers();
  revalidateTag("users");
  return { ok: true, users };
}

export async function deleteUserAction(id: string) {
  const users = await deleteUser(id);
  // refresca el listado
  revalidateTag("users");
  return { ok: true };
}

export async function updateUserAction(id: string, payload: { tenantName?: string }) {
  const updated = await updateUser(id, payload);
  revalidateTag("users");
  return { ok: true, updated };
}

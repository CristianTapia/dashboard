"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/app/lib/auth";
import { createRestaurantTable, deleteRestaurantTable, updateRestaurantTableActive } from "@/app/lib/data/tables";
import { CreateRestaurantTableSchema, UpdateRestaurantTableActiveSchema } from "@/app/lib/validators/tables";

export async function createRestaurantTableAction(payload: unknown) {
  await requireUser();
  const parsed = CreateRestaurantTableSchema.safeParse(payload);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos invalidos");

  const created = await createRestaurantTable(
    {
      name: parsed.data.name,
      number: parsed.data.number,
      active: parsed.data.active,
    },
    parsed.data.tenant_id,
  );

  revalidatePath("/dashboard/mesas");
  return { ok: true, created };
}

export async function updateRestaurantTableActiveAction(id: string, active: boolean) {
  await requireUser();
  const parsed = UpdateRestaurantTableActiveSchema.safeParse({ active });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos invalidos");

  const updated = await updateRestaurantTableActive(id, parsed.data.active);
  revalidatePath("/dashboard/mesas");
  return { ok: true, updated };
}

export async function deleteRestaurantTableAction(id: string) {
  await requireUser();
  await deleteRestaurantTable(id);
  revalidatePath("/dashboard/mesas");
  return { ok: true };
}

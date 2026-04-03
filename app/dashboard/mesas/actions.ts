"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/app/lib/auth";
import { createRestaurantTable, deleteRestaurantTable, updateRestaurantTableActive } from "@/app/lib/data/tables";

export async function createRestaurantTableAction(payload: {
  name?: string;
  number?: string;
  active?: boolean;
  tenant_id?: string;
}) {
  await requireUser();
  const created = await createRestaurantTable(
    {
      name: payload.name,
      number: payload.number,
      active: payload.active,
    },
    payload.tenant_id,
  );

  revalidatePath("/dashboard/mesas");
  return { ok: true, created };
}

export async function updateRestaurantTableActiveAction(id: string, active: boolean) {
  await requireUser();
  const updated = await updateRestaurantTableActive(id, active);
  revalidatePath("/dashboard/mesas");
  return { ok: true, updated };
}

export async function deleteRestaurantTableAction(id: string) {
  await requireUser();
  await deleteRestaurantTable(id);
  revalidatePath("/dashboard/mesas");
  return { ok: true };
}

"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/app/lib/auth";
import {
  createRestaurantTable,
  deleteRestaurantTable,
  updateRestaurantTable,
  updateRestaurantTableActive,
} from "@/app/lib/data/tables";
import {
  CreateRestaurantTableSchema,
  UpdateRestaurantTableActiveSchema,
  UpdateRestaurantTableSchema,
} from "@/app/lib/validators/tables";
import { broadcastTableUpdated } from "@/app/lib/realtime/menu";

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

  await broadcastTableUpdated({
    tableId: created.id,
    tableToken: created.public_token,
    tenantId: created.tenant_id,
    action: "created",
  });
  revalidatePath("/dashboard/mesas");
  return { ok: true, created };
}

export async function updateRestaurantTableActiveAction(id: string, active: boolean) {
  await requireUser();
  const parsed = UpdateRestaurantTableActiveSchema.safeParse({ active });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos invalidos");

  const updated = await updateRestaurantTableActive(id, parsed.data.active);
  await broadcastTableUpdated({
    tableId: updated.id,
    tableToken: updated.public_token,
    tenantId: updated.tenant_id,
    action: "updated",
  });
  revalidatePath("/dashboard/mesas");
  return { ok: true, updated };
}

export async function updateRestaurantTableAction(id: string, payload: unknown) {
  await requireUser();
  const parsed = UpdateRestaurantTableSchema.safeParse(payload);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos invalidos");

  const updated = await updateRestaurantTable(id, parsed.data);
  await broadcastTableUpdated({
    tableId: updated.id,
    tableToken: updated.public_token,
    tenantId: updated.tenant_id,
    action: "updated",
  });
  revalidatePath("/dashboard/mesas");
  return { ok: true, updated };
}

export async function deleteRestaurantTableAction(id: string) {
  await requireUser();
  const deleted = await deleteRestaurantTable(id);
  await broadcastTableUpdated({
    tableId: deleted.id,
    tableToken: deleted.public_token,
    tenantId: deleted.tenant_id,
    action: "deleted",
  });
  revalidatePath("/dashboard/mesas");
  return { ok: true };
}

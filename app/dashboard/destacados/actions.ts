"use server";

import { revalidateTag } from "next/cache";
import { createHighlight, listHighlights, updateHighlight, deleteHighlight } from "@/app/lib/data/highlights";
import { requireUser } from "@/app/lib/auth";
import { CreateHighlightSchema, UpdateHighlightSchema } from "@/app/lib/validators/highlights";

export async function createHighlightAction(payload: unknown) {
  await requireUser();
  const parsed = CreateHighlightSchema.safeParse(payload);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos invalidos");

  const tenantId = typeof payload === "object" && payload !== null && "tenant_id" in payload ? (payload as { tenant_id?: string }).tenant_id : undefined;
  const created = await createHighlight(parsed.data, tenantId);
  // refresca el listado
  revalidateTag("/dashboard/destacados");
  return { ok: true, created };
}

export async function listHighlightsAction() {
  await requireUser();
  const Highlights = await listHighlights();
  revalidateTag("Highlights");
  return { ok: true, Highlights };
}

export async function deleteHighlightAction(id: number) {
  await requireUser();
  await deleteHighlight(id);
  // refresca el listado
  revalidateTag("Highlights");
  return { ok: true };
}

export async function updateHighlightAction(id: number, payload: unknown) {
  await requireUser();
  const parsed = UpdateHighlightSchema.safeParse(payload);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos invalidos");

  const cleanedPayload: typeof parsed.data = { ...parsed.data };
  if (cleanedPayload.image_path === undefined) {
    delete cleanedPayload.image_path;
  } else if (cleanedPayload.image_path === null) {
    cleanedPayload.image_path = null;
  }
  const updated = await updateHighlight(id, cleanedPayload);
  revalidateTag("Highlights");
  // revalidatePath("/dashboard/destacados");
  return { ok: true, updated };
}

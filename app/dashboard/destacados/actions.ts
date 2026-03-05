"use server";

import { revalidateTag } from "next/cache";
import { createHighlight, listHighlights, updateHighlight, deleteHighlight } from "@/app/lib/data/highlights";
import { requireUser } from "@/app/lib/auth";

export async function createHighlightAction(payload: { description: string; image_path: string; tenant_id?: string }) {
  await requireUser();
  const created = await createHighlight({ description: payload.description, image_path: payload.image_path }, payload.tenant_id);
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

export async function updateHighlightAction(id: number, payload: { description?: string; image_path?: string | null }) {
  await requireUser();
  const cleanedPayload: typeof payload = { ...payload };
  if (payload.image_path === undefined) {
    delete cleanedPayload.image_path;
  } else if (payload.image_path === null) {
    cleanedPayload.image_path = null;
  }
  const updated = await updateHighlight(id, cleanedPayload);
  revalidateTag("Highlights");
  // revalidatePath("/dashboard/destacados");
  return { ok: true, updated };
}

"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createHighlight, listHighlights, updateHighlight, deleteHighlight } from "@/app/lib/data/highlights";

export async function createHighlightAction(payload: { description: string; image_path: string }) {
  const created = await createHighlight(payload);
  // refresca el listado
  revalidateTag("/dashboard/destacados");
  return { ok: true, created };
}

export async function listHighlightsAction() {
  const Highlights = await listHighlights();
  revalidateTag("Highlights");
  return { ok: true, Highlights };
}

export async function deleteHighlightAction(id: number) {
  const Highlights = await deleteHighlight(id);
  // refresca el listado
  revalidateTag("Highlights");
  return { ok: true };
}

export async function updateHighlightAction(id: number, payload: { description?: string; image_path?: string | null }) {
  const cleanedPayload = {
    ...payload,
    image_path: payload.image_path === null ? undefined : payload.image_path,
  };
  const updated = await updateHighlight(id, cleanedPayload);
  revalidateTag("Highlights");
  revalidatePath("/dashboard/destacados");
  return { ok: true, updated };
}

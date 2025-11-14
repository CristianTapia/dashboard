"use server";

import { revalidateTag } from "next/cache";
import { createHighlight, listHighlights, updateHighlight, deleteHighlight } from "@/app/lib/data/highlights";

export async function createHighlightAction(payload: { description: string; image_path: string }) {
  const created = await createHighlight(payload);
  // refresca el listado
  revalidateTag("/dashboard/destacados/todos");
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

export async function updateHighlightAction(id: number, payload: { description: string }) {
  const updated = await updateHighlight(id, payload);
  // revalidateTag("Highlights");
  return { ok: true, updated };
}

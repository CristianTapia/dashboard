"use server";

import { revalidatePath } from "next/cache";
import { createHighlight } from "@/app/lib/data/highlights";

export async function createHighlightAction(payload: { description: string; image_path: string | null }) {
  const created = await createHighlight(payload);
  // refresca el listado
  revalidatePath("/dashboard/destacados/todos");
  return { ok: true, created };
}

"use server";

import { revalidatePath } from "next/cache";
import { createCategory } from "@/app/lib/data/categories";

export async function createCategoryAction(payload: { name: string }) {
  const created = await createCategory(payload);
  // refresca el listado
  revalidatePath("/dashboard/productos/todos");
  return { ok: true, created };
}

"use server";

import { revalidateTag } from "next/cache";
import { createCategory } from "@/app/lib/data/categories";
import { listCategories } from "@/app/lib/data/categories";

export async function createCategoryAction(payload: { name: string }) {
  const created = await createCategory(payload);
  // refresca el listado
  revalidateTag("categories");
  return { ok: true, created };
}

export async function listCategoriesAction() {
  const categories = await listCategories();
  return { ok: true, categories };
}

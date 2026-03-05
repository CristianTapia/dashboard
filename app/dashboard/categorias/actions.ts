"use server";

import { revalidateTag } from "next/cache";
import { createCategory, listCategories, deleteCategory, updateCategory } from "@/app/lib/data/categories";
import { requireUser } from "@/app/lib/auth";

export async function createCategoryAction(payload: { name: string }) {
  await requireUser();
  const created = await createCategory(payload);
  // refresca el listado
  revalidateTag("categories");
  return { ok: true, created };
}

export async function listCategoriesAction() {
  await requireUser();
  const categories = await listCategories();
  revalidateTag("categories");
  return { ok: true, categories };
}

export async function deleteCategoryAction(id: number) {
  await requireUser();
  await deleteCategory(id);
  // refresca el listado
  revalidateTag("categories");
  return { ok: true };
}

export async function updateCategoryAction(id: number, payload: { name: string }) {
  await requireUser();
  const updated = await updateCategory(id, payload);
  revalidateTag("categories");
  return { ok: true, updated };
}

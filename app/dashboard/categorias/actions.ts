"use server";

import { revalidateTag } from "next/cache";
import { createCategory, listCategories, deleteCategory, updateCategory } from "@/app/lib/data/categories";
import { requireUser } from "@/app/lib/auth";
import { CreateCategorySchema, UpdateCategorySchema } from "@/app/lib/validators/categories";

export async function createCategoryAction(payload: unknown) {
  await requireUser();
  const parsed = CreateCategorySchema.safeParse(payload);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos invalidos");

  const tenantId = typeof payload === "object" && payload !== null && "tenant_id" in payload ? (payload as { tenant_id?: string }).tenant_id : undefined;
  const created = await createCategory(parsed.data, tenantId);
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

export async function updateCategoryAction(id: number, payload: unknown) {
  await requireUser();
  const parsed = UpdateCategorySchema.safeParse(payload);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos invalidos");

  const updated = await updateCategory(id, parsed.data);
  revalidateTag("categories");
  return { ok: true, updated };
}

"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createProduct, listProducts, updateProduct, deleteProduct } from "@/app/lib/data/products";
import { requireUser } from "@/app/lib/auth";
import { CreateProductSchema, UpdateProductSchema } from "@/app/lib/validators/products";

export async function createProductAction(payload: unknown) {
  await requireUser();
  const parsed = CreateProductSchema.safeParse(payload);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos invalidos");

  const tenantId = typeof payload === "object" && payload !== null && "tenant_id" in payload ? (payload as { tenant_id?: string }).tenant_id : undefined;
  const created = await createProduct(parsed.data, tenantId);
  // refresca el listado
  revalidatePath("/dashboard/productos/todos");
  return { ok: true, created };
}

export async function listProductsAction() {
  await requireUser();
  const Products = await listProducts();
  revalidateTag("Products");
  return { ok: true, Products };
}

export async function deleteProductAction(id: number) {
  await requireUser();
  await deleteProduct(id);
  // refresca el listado
  revalidateTag("Products");
  return { ok: true };
}

export async function updateProductAction(
  id: number,
  payload: unknown,
) {
  await requireUser();
  const parsed = UpdateProductSchema.safeParse(payload);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos invalidos");

  const cleanedPayload: typeof parsed.data = { ...parsed.data };
  if (cleanedPayload.image_path === undefined) {
    delete cleanedPayload.image_path;
  } else if (cleanedPayload.image_path === null) {
    cleanedPayload.image_path = null;
  }
  const updated = await updateProduct(id, cleanedPayload);
  revalidateTag("Products");
  // revalidatePath("/dashboard/productos/todos");
  return { ok: true, updated };
}

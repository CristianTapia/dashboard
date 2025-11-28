"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createProduct, listProducts, updateProduct, deleteProduct } from "@/app/lib/data/products";

export async function createProductAction(payload: {
  name: string;
  price: number;
  stock: number;
  category_id: number;
  description: string;
  image_path: string | null;
}) {
  const created = await createProduct(payload);
  // refresca el listado
  revalidatePath("/dashboard/productos/todos");
  return { ok: true, created };
}

export async function listProductsAction() {
  const Products = await listProducts();
  revalidateTag("Products");
  return { ok: true, Products };
}

export async function deleteProductAction(id: number) {
  const Products = await deleteProduct(id);
  // refresca el listado
  revalidateTag("Products");
  return { ok: true };
}

export async function updateProductAction(
  id: number,
  payload: {
    name?: string;
    price?: number;
    stock?: number;
    category_id?: number;
    description?: string;
    image_path?: string | null;
  }
) {
  const cleanedPayload: typeof payload = { ...payload };
  if (payload.image_path === undefined) {
    delete cleanedPayload.image_path;
  } else if (payload.image_path === null) {
    cleanedPayload.image_path = null;
  }
  const updated = await updateProduct(id, cleanedPayload);
  revalidateTag("Products");
  revalidatePath("/dashboard/destacados/todos");
  return { ok: true, updated };
}

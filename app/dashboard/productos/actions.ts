"use server";

import { revalidatePath } from "next/cache";
import { createProduct } from "@/app/lib/data/products";

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

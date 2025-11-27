// app/lib/data/products.ts
import "server-only";
import { createSupabaseAdmin } from "@/app/lib/supabase";
import { CreateProductInput, UpdateProductInput } from "@/app/lib/validators";
import { signPaths } from "@/app/lib/data/images"; // 👈 helper de firma en lote

export async function listProducts({ limit = 20, offset = 0 }: { limit?: number; offset?: number } = {}) {
  const db = createSupabaseAdmin();
  const { data, error } = await db
    .from("products")
    .select("id,name,price,stock,image_path,created_at,category:categories(id,name)")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Igual que listProducts, pero devuelve cada item con `image_url` firmado (temporal).
 * - Firma en lote para minimizar requests al storage.
 * - `expires` en segundos (default 1h).
 */
export async function listProductsWithSigned({
  limit = 20,
  offset = 0,
  expires = 3600,
}: { limit?: number; offset?: number; expires?: number } = {}) {
  const items = await listProducts({ limit, offset });

  // junta paths y firma en 1 llamada
  const paths = items.map((p) => p.image_path).filter((x): x is string => !!x);
  const urlMap = await signPaths(paths, expires);

  // mapea el resultado agregando `image_url`
  return items.map((p) => ({
    ...p,
    image_url: p.image_path ? urlMap.get(p.image_path) ?? null : null,
  }));
}

export async function createProduct(input: CreateProductInput) {
  const db = createSupabaseAdmin();
  const { data, error } = await db.from("products").insert(input).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateProduct(id: number, input: UpdateProductInput) {
  const db = createSupabaseAdmin();
  const { data, error } = await db.from("products").update(input).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

const IMAGE_BUCKET = process.env.SB_BUCKET_NAME ?? "images";

export async function deleteProduct(id: number) {
  const db = createSupabaseAdmin();
  const { data, error } = await db
    .from("products")
    .delete()
    .eq("id", id)
    .select("id, image_path")
    .maybeSingle<{ id: number; image_path: string | null }>();
  if (error) throw new Error(error.message);

  if (!data) {
    return { ok: true };
  }

  if (data.image_path) {
    const { error: storageError } = await db.storage.from(IMAGE_BUCKET).remove([data.image_path]);
    if (storageError) {
      console.error("deleteProduct storage error:", storageError);
      throw new Error("Producto eliminado pero no se pudo eliminar la imagen asociada");
    }
  }

  return { ok: true };
}

import "server-only";
import { createServer } from "@/app/lib/supabase/server";
import { CreateProductInput, UpdateProductInput } from "@/app/lib/validators";
import { signPaths } from "@/app/lib/data/images";
import { getCurrentTenantId } from "@/app/lib/tenant";

async function assertCategoryBelongsToTenant(categoryId: number, tenantId: string) {
  const supabase = await createServer();
  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("id", categoryId)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Categoria invalida para este tenant");
}

export async function listProducts({ limit = 20, offset = 0 }: { limit?: number; offset?: number } = {}) {
  const supabase = await createServer();
  const tenantId = await getCurrentTenantId();

  const { data, error } = await supabase
    .from("products")
    .select("id,name,price,stock,description,image_path,created_at,category:categories(id,name)")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listProductsWithSigned({
  limit = 20,
  offset = 0,
  expires = 3600,
}: { limit?: number; offset?: number; expires?: number } = {}) {
  const items = await listProducts({ limit, offset });

  const paths = items.map((p) => p.image_path).filter((x): x is string => !!x);
  const urlMap = await signPaths(paths, expires);

  return items.map((p) => ({
    ...p,
    image_url: p.image_path ? urlMap.get(p.image_path) ?? null : null,
  }));
}

export async function createProduct(input: CreateProductInput) {
  const supabase = await createServer();
  const tenantId = await getCurrentTenantId();

  await assertCategoryBelongsToTenant(input.category_id, tenantId);

  const { data, error } = await supabase
    .from("products")
    .insert({ ...input, tenant_id: tenantId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateProduct(id: number, input: UpdateProductInput) {
  const supabase = await createServer();
  const tenantId = await getCurrentTenantId();

  if (typeof input.category_id === "number") {
    await assertCategoryBelongsToTenant(input.category_id, tenantId);
  }

  const { data, error } = await supabase
    .from("products")
    .update(input)
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

const IMAGE_BUCKET = process.env.SB_BUCKET_NAME ?? "images";

export async function deleteProduct(id: number) {
  const supabase = await createServer();
  const tenantId = await getCurrentTenantId();

  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .select("id, image_path")
    .maybeSingle<{ id: number; image_path: string | null }>();

  if (error) throw new Error(error.message);

  if (!data) {
    return { ok: true };
  }

  if (data.image_path) {
    const { error: storageError } = await supabase.storage.from(IMAGE_BUCKET).remove([data.image_path]);
    if (storageError) {
      console.error("deleteProduct storage error:", storageError);
      throw new Error("Producto eliminado pero no se pudo eliminar la imagen asociada");
    }
  }

  return { ok: true };
}

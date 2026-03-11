import "server-only";
import { createServer } from "@/app/lib/supabase/server";
import { createAdmin } from "@/app/lib/supabase";
import { CreateProductInput, UpdateProductInput } from "@/app/lib/validators";
import { signPaths } from "@/app/lib/data/images";
import { getCurrentTenantId, isCurrentUserAdmin, resolveWritableTenantId } from "@/app/lib/tenant";
import type { Product } from "@/app/lib/validators/types";

type TenantShape = { id: string; name: string };
type CategoryShape = { id: number; name: string };
type ProductRow = {
  id: number;
  name: string;
  price: number;
  stock: number | null;
  description: string | null;
  image_path: string | null;
  tenant_id: string | null;
  tenant: TenantShape | TenantShape[] | null;
  category: CategoryShape | CategoryShape[] | null;
};

async function assertCategoryBelongsToTenant(categoryId: number, tenantId: string, useAdmin = false) {
  const db = useAdmin ? createAdmin() : await createServer();
  const { data, error } = await db
    .from("categories")
    .select("id")
    .eq("id", categoryId)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Categoria invalida para este tenant");
}

export async function listProducts({ limit = 20, offset = 0 }: { limit?: number; offset?: number } = {}) {
  const isAdmin = await isCurrentUserAdmin();
  const tenantId = isAdmin ? null : await getCurrentTenantId();
  const db = isAdmin ? createAdmin() : await createServer();

  let query = db
    .from("products")
    .select("id,name,price,stock,description,image_path,created_at,tenant_id,tenant:tenants(id,name),category:categories(id,name)")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  const rows = (data ?? []) as ProductRow[];

  return rows.map((row): Product => {
    const tenantValue = Array.isArray(row.tenant) ? row.tenant[0] ?? null : row.tenant ?? null;
    const categoryValue = Array.isArray(row.category) ? row.category[0] ?? null : row.category ?? null;
    return {
      id: row.id,
      name: row.name,
      price: row.price,
      stock: row.stock ?? 0,
      description: row.description ?? "",
      image_path: row.image_path,
      tenant_id: row.tenant_id,
      tenant: tenantValue ? { id: tenantValue.id, name: tenantValue.name } : null,
      category: categoryValue ? { id: categoryValue.id, name: categoryValue.name } : { id: 0, name: "Sin categoría" },
    };
  });
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

export async function createProduct(input: CreateProductInput, requestedTenantId?: string) {
  const supabase = await createServer();
  const tenantId = await resolveWritableTenantId(requestedTenantId);
  const adminWrite = await isCurrentUserAdmin();
  const db = adminWrite ? createAdmin() : supabase;

  await assertCategoryBelongsToTenant(input.category_id, tenantId, adminWrite);

  const { data, error } = await db
    .from("products")
    .insert({ ...input, tenant_id: tenantId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateProduct(id: number, input: UpdateProductInput) {
  const isAdmin = await isCurrentUserAdmin();
  const tenantId = isAdmin ? null : await getCurrentTenantId();
  const db = isAdmin ? createAdmin() : await createServer();

  if (typeof input.category_id === "number") {
    if (!isAdmin && tenantId) {
      await assertCategoryBelongsToTenant(input.category_id, tenantId);
    } else {
      const { data: product, error: productError } = await db
        .from("products")
        .select("tenant_id")
        .eq("id", id)
        .maybeSingle<{ tenant_id: string | null }>();

      if (productError) throw new Error(productError.message);
      if (!product?.tenant_id) throw new Error("Producto no encontrado");

      const admin = createAdmin();
      const { data: category, error: categoryError } = await admin
        .from("categories")
        .select("id")
        .eq("id", input.category_id)
        .eq("tenant_id", product.tenant_id)
        .maybeSingle();

      if (categoryError) throw new Error(categoryError.message);
      if (!category) throw new Error("Categoria invalida para este tenant");
    }
  }

  let query = db.from("products").update(input).eq("id", id);
  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  }

  const { data, error } = await query.select().maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Producto no encontrado o sin permisos");
  return data;
}

const IMAGE_BUCKET = process.env.SB_BUCKET_NAME ?? "images";

export async function deleteProduct(id: number) {
  const isAdmin = await isCurrentUserAdmin();
  const tenantId = isAdmin ? null : await getCurrentTenantId();
  const db = isAdmin ? createAdmin() : await createServer();

  let query = db.from("products").delete().eq("id", id);
  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  }

  const { data, error } = await query.select("id, image_path").maybeSingle<{ id: number; image_path: string | null }>();

  if (error) throw new Error(error.message);

  if (!data) {
    return { ok: true };
  }

  if (data.image_path) {
    const admin = createAdmin();
    const { error: storageError } = await admin.storage.from(IMAGE_BUCKET).remove([data.image_path]);
    if (storageError) {
      console.error("deleteProduct storage error:", storageError);
      throw new Error("Producto eliminado pero no se pudo eliminar la imagen asociada");
    }
  }

  return { ok: true };
}

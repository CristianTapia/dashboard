import "server-only";
import { createAdmin } from "@/app/lib/supabase";
import { getCurrentTenantId, isCurrentUserAdmin, resolveWritableTenantId } from "@/app/lib/tenant";
import { CreateCategoryInput, UpdateCategoryInput } from "../validators";
import type { Category } from "../validators/types";
import { createServer } from "@/app/lib/supabase/Server";

type TenantShape = { id: string; name: string };
type CategoryRow = {
  id: number;
  name: string;
  tenant_id: string | null;
  tenant: TenantShape | TenantShape[] | null;
};

export async function listCategories() {
  const isAdmin = await isCurrentUserAdmin();
  const tenantId = isAdmin ? null : await getCurrentTenantId();
  const db = createAdmin();

  let query = db
    .from("categories")
    .select("id,name,tenant_id,tenant:tenants(id,name)")
    .order("name", { ascending: false });

  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as CategoryRow[];

  return rows.map((row): Category => {
    const tenantValue = Array.isArray(row.tenant) ? row.tenant[0] ?? null : row.tenant ?? null;
    return {
      id: row.id,
      name: row.name,
      tenant_id: row.tenant_id,
      tenant: tenantValue ? { id: tenantValue.id, name: tenantValue.name } : null,
    };
  });
}

export async function createCategory(input: CreateCategoryInput, requestedTenantId?: string) {
  const supabase = await createServer();
  const tenantId = await resolveWritableTenantId(requestedTenantId);
  const adminWrite = await isCurrentUserAdmin();
  const db = adminWrite ? createAdmin() : supabase;

  const { data, error } = await db
    .from("categories")
    .insert({ ...input, tenant_id: tenantId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateCategory(id: number, input: UpdateCategoryInput) {
  const isAdmin = await isCurrentUserAdmin();
  const tenantId = isAdmin ? null : await getCurrentTenantId();
  const db = isAdmin ? createAdmin() : await createServer();

  let query = db.from("categories").update(input).eq("id", id);
  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  }

  const { data, error } = await query.select().maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Categoria no encontrada o sin permisos");
  return data;
}

export async function deleteCategory(id: number) {
  const isAdmin = await isCurrentUserAdmin();
  const tenantId = isAdmin ? null : await getCurrentTenantId();
  const db = isAdmin ? createAdmin() : await createServer();

  let categoryQuery = db.from("categories").select("id, tenant_id").eq("id", id);
  if (tenantId) {
    categoryQuery = categoryQuery.eq("tenant_id", tenantId);
  }

  const { data: category, error: categoryError } = await categoryQuery.maybeSingle<{
    id: number;
    tenant_id: string | null;
  }>();

  if (categoryError) throw new Error(categoryError.message);
  if (!category) throw new Error("Categoria no encontrada o sin permisos");

  let productsQuery = db.from("products").select("id", { count: "exact", head: true }).eq("category_id", id);
  if (category.tenant_id) {
    productsQuery = productsQuery.eq("tenant_id", category.tenant_id);
  }

  const { count, error: productsError } = await productsQuery;
  if (productsError) throw new Error(productsError.message);
  if ((count ?? 0) > 0) {
    throw new Error("No puedes eliminar una categoria que aun tiene productos asociados");
  }

  let deleteQuery = db.from("categories").delete().eq("id", id);
  if (tenantId) {
    deleteQuery = deleteQuery.eq("tenant_id", tenantId);
  }

  const { error } = await deleteQuery;
  if (error) throw new Error(error.message);

  return { ok: true, tenant_id: category.tenant_id };
}

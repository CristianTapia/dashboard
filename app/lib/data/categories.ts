import "server-only";
import { createServer } from "@/app/lib/supabase/server";
import { createAdmin } from "@/app/lib/supabase";
import { getCurrentTenantId, isCurrentUserAdmin, resolveWritableTenantId } from "@/app/lib/tenant";
import { CreateCategoryInput, UpdateCategoryInput } from "../validators";
import type { Category } from "../validators/types";

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
  const db = isAdmin ? createAdmin() : await createServer();

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
  const supabase = await createServer();
  const tenantId = await getCurrentTenantId();

  const { data, error } = await supabase
    .from("categories")
    .update(input)
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCategory(id: number) {
  const supabase = await createServer();
  const tenantId = await getCurrentTenantId();

  const { error } = await supabase.from("categories").delete().eq("id", id).eq("tenant_id", tenantId);

  if (error) throw new Error(error.message);
  return { ok: true };
}

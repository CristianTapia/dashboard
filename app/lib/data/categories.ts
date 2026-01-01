import "server-only";
import { createServer } from "@/app/lib/supabase/server";
import { getCurrentTenantId } from "@/app/lib/tenant";
import { CreateCategoryInput, UpdateCategoryInput } from "../validators";

export async function listCategories() {
  const supabase = await createServer();
  const tenantId = await getCurrentTenantId();

  const { data, error } = await supabase
    .from("categories")
    .select("id,name")
    .eq("tenant_id", tenantId)
    .order("name", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createCategory(input: CreateCategoryInput) {
  const supabase = await createServer();
  const tenantId = await getCurrentTenantId();

  const { data, error } = await supabase
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

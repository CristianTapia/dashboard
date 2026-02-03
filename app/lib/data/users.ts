import "server-only";
import { createAdmin } from "@/app/lib/supabase/admin";
import { CreateUserInput, UpdateUserInput } from "@/app/lib/validators/users";

export async function listUsers() {
  const supabase = createAdmin();

  const { data, error } = await supabase
    .from("tenants")
    .select("id,name")
    .order("name", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createUser(input: CreateUserInput) {
  const supabase = createAdmin();

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });

  if (authError || !authData?.user) throw new Error(authError?.message || "Error creando usuario");

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .insert({ name: input.tenantName })
    .select()
    .single();

  if (tenantError || !tenant) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error(tenantError?.message || "Error creando tenant");
  }

  const { error: memberError } = await supabase.from("tenant_members").insert({
    tenant_id: tenant.id,
    user_id: authData.user.id,
    role: input.role ?? "owner",
  });

  if (memberError) {
    await supabase.from("tenants").delete().eq("id", tenant.id);
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error(memberError.message);
  }

  return { tenant, user: authData.user };
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const supabase = createAdmin();

  const updates: { name?: string } = {};
  if (input.tenantName) updates.name = input.tenantName;
  if (Object.keys(updates).length === 0) return null;

  const { data, error } = await supabase
    .from("tenants")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteUser(id: string) {
  const supabase = createAdmin();

  const { error } = await supabase.from("tenants").delete().eq("id", id);

  if (error) throw new Error(error.message);
  return { ok: true };
}

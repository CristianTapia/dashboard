import "server-only";
import { createAdmin } from "@/app/lib/supabase/admin";
import { CreateUserInput, UpdateUserInput } from "@/app/lib/validators/users";
import { unstable_cache } from "next/cache";

type TenantShape = { id: string; name: string };
type MembershipRow = {
  user_id: string;
  role: string | null;
  tenant_id: string | null;
  tenants: TenantShape | TenantShape[] | null;
};

const listUsersCached = unstable_cache(
  async () => {
    const supabase = createAdmin();

    const { data: memberships, error: membershipError } = await supabase
      .from("tenant_members")
      .select("user_id, role, tenant_id, tenants:tenant_id ( id, name )")
      .order("created_at", { ascending: false });

    if (membershipError) throw new Error(membershipError.message);

    const normalizedMemberships = ((memberships ?? []) as unknown) as MembershipRow[];

    const userIds = Array.from(new Set(normalizedMemberships.map((m) => m.user_id))).filter(Boolean);
    let usersById = new Map<string, { id: string; email: string | null }>();

    if (userIds.length > 0) {
      const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

      if (usersError) throw new Error(usersError.message);
      const filtered = (usersData?.users ?? []).filter((u) => userIds.includes(u.id));
      usersById = new Map(filtered.map((u) => [u.id, { id: u.id, email: u.email ?? null }]));
    }

    return normalizedMemberships.map((m) => {
      const tenantValue = Array.isArray(m.tenants) ? m.tenants[0] ?? null : m.tenants;
      return {
        userId: m.user_id,
        email: usersById.get(m.user_id)?.email ?? null,
        role: m.role,
        tenantId: m.tenant_id,
        tenantName: tenantValue?.name ?? "Sin nombre",
      };
    });
  },
  ["users:list"],
  { tags: ["users"], revalidate: 300 },
);

export async function listUsers() {
  return listUsersCached();
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
    role: input.role ?? "member",
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

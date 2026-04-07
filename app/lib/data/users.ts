import "server-only";
import { createAdmin } from "@/app/lib/supabase/admin";
import { CreateUserInput, UpdateUserInput } from "@/app/lib/validators/users";
import { unstable_cache } from "next/cache";

type TenantShape = { id: string; name: string; domain: string | null };
type MembershipRow = {
  user_id: string;
  role: string | null;
  tenant_id: string | null;
  tenants: TenantShape | TenantShape[] | null;
};

function slugifyTenantDomain(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

async function ensureUniqueTenantDomain(
  supabase: ReturnType<typeof createAdmin>,
  desiredValue: string,
  excludeTenantId?: string,
) {
  const baseValue = slugifyTenantDomain(desiredValue);
  if (!baseValue) throw new Error("La clave publica es obligatoria");

  let candidate = baseValue;
  let attempt = 1;

  while (attempt <= 50) {
    let query = supabase.from("tenants").select("id").eq("domain", candidate).limit(1);
    if (excludeTenantId) query = query.neq("id", excludeTenantId);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return candidate;

    if (excludeTenantId) {
      throw new Error("La clave publica ya esta en uso");
    }

    attempt += 1;
    candidate = `${baseValue}-${attempt}`;
  }

  throw new Error("No se pudo generar una clave publica disponible");
}

const listUsersCached = unstable_cache(
  async () => {
    const supabase = createAdmin();

    const { data: memberships, error: membershipError } = await supabase
      .from("tenant_members")
      .select("user_id, role, tenant_id, tenants:tenant_id ( id, name, domain )")
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
        tenantDomain: tenantValue?.domain ?? null,
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
  const tenantDomain = await ensureUniqueTenantDomain(supabase, input.tenantDomain ?? input.tenantName);

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });

  if (authError || !authData?.user) throw new Error(authError?.message || "Error creando usuario");

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .insert({ name: input.tenantName, domain: tenantDomain })
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

  const tenantUpdates: { name?: string; domain?: string } = {};
  if (input.tenantName) tenantUpdates.name = input.tenantName;
  if (input.tenantDomain) {
    tenantUpdates.domain = await ensureUniqueTenantDomain(supabase, input.tenantDomain, id);
  }

  let tenantData: unknown = null;

  if (Object.keys(tenantUpdates).length > 0) {
    const { data, error } = await supabase.from("tenants").update(tenantUpdates).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    tenantData = data;
  }

  if (input.role) {
    if (!input.userId) throw new Error("Falta el usuario para actualizar el rol");

    const { error } = await supabase
      .from("tenant_members")
      .update({ role: input.role })
      .eq("tenant_id", id)
      .eq("user_id", input.userId);

    if (error) throw new Error(error.message);
  }

  return tenantData;
}

export async function deleteUser(id: string) {
  const supabase = createAdmin();
  const { data: members, error: membersError } = await supabase
    .from("tenant_members")
    .select("user_id")
    .eq("tenant_id", id);

  if (membersError) throw new Error(membersError.message);

  const memberUserIds = Array.from(new Set((members ?? []).map((member) => member.user_id).filter(Boolean)));

  const deleteByTenant = async (table: string) => {
    const { error } = await supabase.from(table).delete().eq("tenant_id", id);
    if (error) throw new Error(error.message);
  };

  await deleteByTenant("table_events");
  await deleteByTenant("restaurant_tables");
  await deleteByTenant("highlights");
  await deleteByTenant("products");
  await deleteByTenant("categories");
  await deleteByTenant("tenant_members");

  const { error: tenantError } = await supabase.from("tenants").delete().eq("id", id);

  if (tenantError) throw new Error(tenantError.message);

  for (const userId of memberUserIds) {
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) throw new Error(authError.message);
  }

  return { ok: true };
}

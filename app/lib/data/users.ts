import "server-only";
import { createAdmin } from "@/app/lib/supabase/Admin";
import { CreateUserInput, UpdateUserInput } from "@/app/lib/validators/users";
import { unstable_cache } from "next/cache";
import { getCurrentTenantId, getTenantAccessContext } from "@/app/lib/tenant";

type TenantShape = {
  id: string;
  name: string;
  domain: string | null;
  active: boolean | null;
  address: string | null;
  maps_url: string | null;
  menu_themes_enabled: boolean | null;
  menu_theme: string | null;
};
type MembershipRow = {
  user_id: string;
  role: string | null;
  tenant_id: string | null;
  tenants: TenantShape | TenantShape[] | null;
};

type AuthUserSummary = {
  id: string;
  email: string | null;
  loginName: string | null;
  displayName: string | null;
};

export type TenantTeamRow = {
  userId: string;
  name: string | null;
  loginName: string | null;
  email: string | null;
  role: string | null;
  salons: string[];
  tableIds: string[];
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

function normalizeLoginName(value: string) {
  return value.trim().toLowerCase();
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

async function listAuthUsers(supabase: ReturnType<typeof createAdmin>) {
  const allUsers: AuthUserSummary[] = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(error.message);

    const users = data?.users ?? [];
    allUsers.push(
      ...users.map((user) => ({
        id: user.id,
        email: user.email ?? null,
        loginName: typeof user.user_metadata?.login_name === "string" ? user.user_metadata.login_name : null,
        displayName:
          typeof user.user_metadata?.display_name === "string"
            ? user.user_metadata.display_name
            : typeof user.user_metadata?.name === "string"
              ? user.user_metadata.name
              : null,
      })),
    );

    if (users.length < 1000) break;
    page += 1;
  }

  return allUsers;
}

async function ensureUniqueLoginName(
  supabase: ReturnType<typeof createAdmin>,
  desiredValue: string,
  excludeUserId?: string,
) {
  const loginName = normalizeLoginName(desiredValue);
  const users = await listAuthUsers(supabase);
  const found = users.find((user) => user.loginName === loginName && user.id !== excludeUserId);

  if (found) throw new Error("El nombre de acceso ya esta en uso");

  return loginName;
}

export async function resolveEmailByLoginName(loginName: string) {
  const supabase = createAdmin();
  const normalizedLoginName = normalizeLoginName(loginName);
  if (!normalizedLoginName) return null;

  const users = await listAuthUsers(supabase);
  return users.find((user) => user.loginName === normalizedLoginName)?.email ?? null;
}

export async function userHasActiveTenant(email: string) {
  const supabase = createAdmin();
  const users = await listAuthUsers(supabase);
  const user = users.find((item) => item.email?.toLowerCase() === email.toLowerCase());
  if (!user) return false;

  const { data, error } = await supabase
    .from("tenant_members")
    .select("tenant:tenants(active)")
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  return ((data ?? []) as Array<{ tenant: { active: boolean | null } | { active: boolean | null }[] | null }>).some(
    (row) => {
      const tenant = Array.isArray(row.tenant) ? row.tenant[0] ?? null : row.tenant;
      return tenant?.active !== false;
    },
  );
}

const listUsersCached = unstable_cache(
  async () => {
    const supabase = createAdmin();

    const { data: memberships, error: membershipError } = await supabase
      .from("tenant_members")
      .select(
        "user_id, role, tenant_id, tenants:tenant_id ( id, name, domain, active, address, maps_url, menu_themes_enabled, menu_theme )",
      )
      .order("created_at", { ascending: false });

    if (membershipError) throw new Error(membershipError.message);

    const normalizedMemberships = ((memberships ?? []) as unknown) as MembershipRow[];

    const userIds = Array.from(new Set(normalizedMemberships.map((m) => m.user_id))).filter(Boolean);
    let usersById = new Map<string, AuthUserSummary>();

    if (userIds.length > 0) {
      const filtered = (await listAuthUsers(supabase)).filter((u) => userIds.includes(u.id));
      usersById = new Map(filtered.map((u) => [u.id, u]));
    }

    return normalizedMemberships.map((m) => {
      const user = usersById.get(m.user_id);
      const tenantValue = Array.isArray(m.tenants) ? m.tenants[0] ?? null : m.tenants;
      return {
        userId: m.user_id,
        loginName: user?.loginName ?? null,
        email: user?.email ?? null,
        role: m.role,
        tenantId: m.tenant_id,
        tenantName: tenantValue?.name ?? "Sin nombre",
        tenantDomain: tenantValue?.domain ?? null,
        tenantActive: tenantValue?.active ?? true,
        tenantAddress: tenantValue?.address ?? null,
        tenantMapsUrl: tenantValue?.maps_url ?? null,
        tenantMenuThemesEnabled: tenantValue?.menu_themes_enabled ?? false,
        tenantMenuTheme: tenantValue?.menu_theme ?? "default",
      };
    });
  },
  ["users:list"],
  { tags: ["users"], revalidate: 300 },
);

export async function listUsers() {
  return listUsersCached();
}

export async function listTenantTeam() {
  const tenantId = await getCurrentTenantId();
  const supabase = createAdmin();

  const [{ data: memberships, error: membershipError }, { data: assignments, error: assignmentsError }] =
    await Promise.all([
      supabase.from("tenant_members").select("user_id, role").eq("tenant_id", tenantId).order("created_at", { ascending: false }),
      supabase.from("tenant_staff_assignments").select("user_id,salon,table_id").eq("tenant_id", tenantId),
    ]);

  if (membershipError) throw new Error(membershipError.message);
  if (assignmentsError) throw new Error(assignmentsError.message);

  const rows = (memberships ?? []) as Array<{ user_id: string; role: string | null }>;
  const usersById = new Map((await listAuthUsers(supabase)).map((user) => [user.id, user]));
  const assignmentsByUser = new Map<string, { salons: string[]; tableIds: string[] }>();

  for (const assignment of (assignments ?? []) as Array<{ user_id: string; salon: string | null; table_id: string | null }>) {
    const current = assignmentsByUser.get(assignment.user_id) ?? { salons: [], tableIds: [] };
    if (assignment.salon) current.salons.push(assignment.salon);
    if (assignment.table_id) current.tableIds.push(assignment.table_id);
    assignmentsByUser.set(assignment.user_id, current);
  }

  return rows.map((row): TenantTeamRow => {
    const user = usersById.get(row.user_id);
    const userAssignments = assignmentsByUser.get(row.user_id) ?? { salons: [], tableIds: [] };
    return {
      userId: row.user_id,
      name: user?.displayName ?? null,
      loginName: user?.loginName ?? null,
      email: user?.email ?? null,
      role: row.role,
      salons: Array.from(new Set(userAssignments.salons)),
      tableIds: Array.from(new Set(userAssignments.tableIds)),
    };
  });
}

export async function createTenantStaffUser(input: {
  name: string;
  loginName: string;
  email?: string;
  password: string;
  role?: "tenant_admin" | "staff";
  salons?: string[];
  tableIds?: string[];
}) {
  const tenantCtx = await getTenantAccessContext();
  if (!tenantCtx.isTenantAdmin || tenantCtx.isAdmin) throw new Error("Permisos insuficientes");

  const supabase = createAdmin();
  const tenantId = tenantCtx.activeTenantId;
  const loginName = await ensureUniqueLoginName(supabase, input.loginName);
  const displayName = input.name.trim();
  const email = input.email?.trim() || `${loginName}@${tenantId}.staff.lab3c.local`;

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      display_name: displayName,
      name: displayName,
      login_name: loginName,
      contact_email: input.email ?? null,
    },
  });

  if (authError || !authData?.user) throw new Error(authError?.message || "Error creando usuario");

  const role = input.role === "tenant_admin" ? "tenant_admin" : "staff";
  const { error: memberError } = await supabase.from("tenant_members").insert({
    tenant_id: tenantId,
    user_id: authData.user.id,
    role,
  });

  if (memberError) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error(memberError.message);
  }

  await replaceTenantStaffAssignments(supabase, tenantId, authData.user.id, input.salons ?? [], input.tableIds ?? []);
  return {
    userId: authData.user.id,
    name: displayName,
    loginName,
    email,
    role,
    salons: input.salons ?? [],
    tableIds: input.tableIds ?? [],
  } satisfies TenantTeamRow;
}

async function replaceTenantStaffAssignments(
  supabase: ReturnType<typeof createAdmin>,
  tenantId: string,
  userId: string,
  salons: string[],
  tableIds: string[],
) {
  const normalizedSalons = Array.from(new Set(salons.map((salon) => salon.trim()).filter(Boolean)));
  const normalizedTableIds = Array.from(new Set(tableIds.map((tableId) => tableId.trim()).filter(Boolean)));

  const { error: deleteError } = await supabase
    .from("tenant_staff_assignments")
    .delete()
    .eq("tenant_id", tenantId)
    .eq("user_id", userId);
  if (deleteError) throw new Error(deleteError.message);

  const payload = [
    ...normalizedSalons.map((salon) => ({ tenant_id: tenantId, user_id: userId, salon, table_id: null })),
    ...normalizedTableIds.map((tableId) => ({ tenant_id: tenantId, user_id: userId, salon: null, table_id: tableId })),
  ];

  if (payload.length === 0) return;

  const { error } = await supabase.from("tenant_staff_assignments").insert(payload);
  if (error) throw new Error(error.message);
}

export async function updateTenantStaffAssignments(
  userId: string,
  input: {
    name?: string;
    loginName?: string;
    password?: string;
    salons?: string[];
    tableIds?: string[];
    role?: "tenant_admin" | "staff";
  },
) {
  const tenantCtx = await getTenantAccessContext();
  if (!tenantCtx.isTenantAdmin || tenantCtx.isAdmin) throw new Error("Permisos insuficientes");

  const supabase = createAdmin();
  const tenantId = tenantCtx.activeTenantId;

  if (input.name !== undefined || input.loginName || input.password) {
    const { data: currentUser, error: currentUserError } = await supabase.auth.admin.getUserById(userId);
    if (currentUserError) throw new Error(currentUserError.message);

    const userUpdate: {
      password?: string;
      user_metadata?: Record<string, unknown>;
    } = {};

    if (input.name !== undefined || input.loginName) {
      const metadata = { ...(currentUser.user?.user_metadata ?? {}) };

      if (input.name !== undefined) {
        const displayName = input.name.trim();
        if (!displayName) throw new Error("El nombre es obligatorio");
        metadata.display_name = displayName;
        metadata.name = displayName;
      }

      if (input.loginName) {
        metadata.login_name = await ensureUniqueLoginName(supabase, input.loginName, userId);
      }

      userUpdate.user_metadata = metadata;
    }

    if (input.password) {
      userUpdate.password = input.password;
    }

    const { error } = await supabase.auth.admin.updateUserById(userId, userUpdate);
    if (error) throw new Error(error.message);
  }

  if (input.role) {
    const { error } = await supabase
      .from("tenant_members")
      .update({ role: input.role })
      .eq("tenant_id", tenantId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
  }

  await replaceTenantStaffAssignments(supabase, tenantId, userId, input.salons ?? [], input.tableIds ?? []);
  return { ok: true };
}

export async function deleteTenantStaffUser(userId: string) {
  const tenantCtx = await getTenantAccessContext();
  if (!tenantCtx.isTenantAdmin || tenantCtx.isAdmin) throw new Error("Permisos insuficientes");

  const supabase = createAdmin();
  const tenantId = tenantCtx.activeTenantId;

  const { data: membership, error: membershipError } = await supabase
    .from("tenant_members")
    .select("role")
    .eq("tenant_id", tenantId)
    .eq("user_id", userId)
    .maybeSingle<{ role: string | null }>();

  if (membershipError) throw new Error(membershipError.message);
  if (!membership) throw new Error("Usuario no encontrado");
  if (membership.role !== "staff") throw new Error("Solo se pueden eliminar garzones");

  const { error: assignmentsError } = await supabase
    .from("tenant_staff_assignments")
    .delete()
    .eq("tenant_id", tenantId)
    .eq("user_id", userId);
  if (assignmentsError) throw new Error(assignmentsError.message);

  const { error: memberError } = await supabase
    .from("tenant_members")
    .delete()
    .eq("tenant_id", tenantId)
    .eq("user_id", userId);
  if (memberError) throw new Error(memberError.message);

  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  if (authError) throw new Error(authError.message);

  return { ok: true };
}

export async function createUser(input: CreateUserInput) {
  const supabase = createAdmin();
  const tenantDomain = await ensureUniqueTenantDomain(supabase, input.tenantDomain ?? input.tenantName);
  const loginName = await ensureUniqueLoginName(supabase, input.loginName);

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      login_name: loginName,
      contact_email: input.email,
    },
  });

  if (authError || !authData?.user) throw new Error(authError?.message || "Error creando usuario");

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .insert({
      name: input.tenantName,
      domain: tenantDomain,
      active: true,
      address: input.tenantAddress || null,
      maps_url: input.tenantMapsUrl || null,
      menu_themes_enabled: input.tenantMenuThemesEnabled ?? false,
      menu_theme: input.tenantMenuTheme ?? "default",
    })
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

  const tenantUpdates: {
    name?: string;
    domain?: string;
    address?: string | null;
    maps_url?: string | null;
    menu_themes_enabled?: boolean;
    menu_theme?: string;
  } = {};
  if (input.tenantName) tenantUpdates.name = input.tenantName;
  if (input.tenantDomain) {
    tenantUpdates.domain = await ensureUniqueTenantDomain(supabase, input.tenantDomain, id);
  }
  if (input.tenantAddress !== undefined) tenantUpdates.address = input.tenantAddress || null;
  if (input.tenantMapsUrl !== undefined) tenantUpdates.maps_url = input.tenantMapsUrl || null;
  if (input.tenantMenuThemesEnabled !== undefined) tenantUpdates.menu_themes_enabled = input.tenantMenuThemesEnabled;
  if (input.tenantMenuTheme !== undefined) tenantUpdates.menu_theme = input.tenantMenuTheme;

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

  if (input.loginName) {
    if (!input.userId) throw new Error("Falta el usuario para actualizar el nombre de acceso");

    const loginName = await ensureUniqueLoginName(supabase, input.loginName, input.userId);
    const { data: currentUser, error: currentUserError } = await supabase.auth.admin.getUserById(input.userId);
    if (currentUserError) throw new Error(currentUserError.message);

    const { error } = await supabase.auth.admin.updateUserById(input.userId, {
      user_metadata: {
        ...(currentUser.user?.user_metadata ?? {}),
        login_name: loginName,
      },
    });

    if (error) throw new Error(error.message);
  }

  if (input.password) {
    if (!input.userId) throw new Error("Falta el usuario para actualizar la contrasena");

    const { error } = await supabase.auth.admin.updateUserById(input.userId, {
      password: input.password,
    });

    if (error) throw new Error(error.message);
  }

  return tenantData;
}

export async function updateTenantActive(id: string, active: boolean) {
  const supabase = createAdmin();
  const { data, error } = await supabase.from("tenants").update({ active }).eq("id", id).select("id, active").single();
  if (error) throw new Error(error.message);
  return data;
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

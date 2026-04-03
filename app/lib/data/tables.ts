import "server-only";

import { randomBytes } from "crypto";

import { createAdmin, createServer } from "@/app/lib/supabase";
import { getCurrentTenantId, isCurrentUserAdmin, resolveWritableTenantId } from "@/app/lib/tenant";
import { RestaurantTable } from "@/app/lib/validators/types";

type TenantRow = {
  id: string;
  name: string;
  domain: string | null;
};

type RestaurantTableRow = {
  id: string;
  tenant_id: string;
  public_token: string;
  name: string | null;
  number: string | null;
  active: boolean;
  created_at: string;
};

function isMissingTablesRelation(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return error.code === "42P01" || error.message?.includes('relation "public.restaurant_tables" does not exist') === true;
}

function normalizeOptionalText(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function buildLabel(table: Pick<RestaurantTableRow, "name" | "number">) {
  if (table.name?.trim()) return table.name.trim();
  if (table.number?.trim()) return `Mesa ${table.number.trim()}`;
  return "Mesa";
}

function getMenuBaseUrl() {
  return (process.env.NEXT_PUBLIC_MENU_BASE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

function buildPublicToken() {
  const randomToken = randomBytes(9).toString("base64url");
  return `t-${randomToken}`;
}

async function loadTenantsMap(db: ReturnType<typeof createAdmin> | Awaited<ReturnType<typeof createServer>>, tenantIds: string[]) {
  const uniqueTenantIds = Array.from(new Set(tenantIds.filter(Boolean)));
  if (uniqueTenantIds.length === 0) return new Map<string, TenantRow>();

  const { data, error } = await db.from("tenants").select("id,name,domain").in("id", uniqueTenantIds);
  if (error) throw new Error(error.message);

  return new Map(((data ?? []) as TenantRow[]).map((tenant) => [tenant.id, tenant]));
}

function mapTable(row: RestaurantTableRow, tenant: TenantRow | null): RestaurantTable {
  const menuBase = getMenuBaseUrl();
  const tenantKey = tenant?.domain?.trim() || tenant?.id || row.tenant_id;

  return {
    id: row.id,
    tenant_id: row.tenant_id,
    public_token: row.public_token,
    name: row.name,
    number: row.number,
    active: row.active,
    created_at: row.created_at,
    label: buildLabel(row),
    short_url: `${menuBase}/m/${encodeURIComponent(row.public_token)}`,
    tenant_url: `${menuBase}/menu/${encodeURIComponent(tenantKey)}/${encodeURIComponent(row.public_token)}`,
    tenant: tenant
      ? {
          id: tenant.id,
          name: tenant.name,
          domain: tenant.domain,
        }
      : null,
  };
}

export async function listRestaurantTables() {
  const adminUser = await isCurrentUserAdmin();
  const currentTenantId = await getCurrentTenantId();
  const db = createAdmin();

  let query = db
    .from("restaurant_tables")
    .select("id,tenant_id,public_token,name,number,active,created_at")
    .order("created_at", { ascending: false });

  if (!adminUser) {
    query = query.eq("tenant_id", currentTenantId);
  }

  const { data, error } = await query;
  if (error) {
    if (isMissingTablesRelation(error)) return [];
    throw new Error(error.message);
  }

  const rows = (data ?? []) as RestaurantTableRow[];
  const tenantsMap = await loadTenantsMap(db, rows.map((row) => row.tenant_id));
  return rows.map((row) => mapTable(row, tenantsMap.get(row.tenant_id) ?? null));
}

export async function createRestaurantTable(
  input: {
    name?: string | null;
    number?: string | null;
    active?: boolean;
  },
  requestedTenantId?: string,
) {
  const tenantId = await resolveWritableTenantId(requestedTenantId);
  const adminUser = await isCurrentUserAdmin();
  const db = adminUser ? createAdmin() : await createServer();

  const name = normalizeOptionalText(input.name);
  const number = normalizeOptionalText(input.number);

  if (!name && !number) {
    throw new Error("Debes indicar un nombre o numero de mesa");
  }

  const insertPayload = {
    tenant_id: tenantId,
    name,
    number,
    active: input.active ?? true,
    public_token: buildPublicToken(),
  };

  const { data, error } = await db
    .from("restaurant_tables")
    .insert(insertPayload)
    .select("id,tenant_id,public_token,name,number,active,created_at")
    .single<RestaurantTableRow>();

  if (error) {
    if (isMissingTablesRelation(error)) {
      throw new Error("La tabla restaurant_tables aun no existe en la base de datos. Aplica la migracion pendiente.");
    }
    throw new Error(error.message);
  }

  const tenantsMap = await loadTenantsMap(db, [data.tenant_id]);
  return mapTable(data, tenantsMap.get(data.tenant_id) ?? null);
}

export async function updateRestaurantTableActive(id: string, active: boolean) {
  const adminUser = await isCurrentUserAdmin();
  const currentTenantId = await getCurrentTenantId();
  const db = adminUser ? createAdmin() : await createServer();

  let query = db.from("restaurant_tables").update({ active, updated_at: new Date().toISOString() }).eq("id", id);

  if (!adminUser) {
    query = query.eq("tenant_id", currentTenantId);
  }

  const { data, error } = await query
    .select("id,tenant_id,public_token,name,number,active,created_at")
    .single<RestaurantTableRow>();

  if (error) {
    if (isMissingTablesRelation(error)) {
      throw new Error("La tabla restaurant_tables aun no existe en la base de datos. Aplica la migracion pendiente.");
    }
    throw new Error(error.message);
  }

  const tenantsMap = await loadTenantsMap(db, [data.tenant_id]);
  return mapTable(data, tenantsMap.get(data.tenant_id) ?? null);
}

export async function deleteRestaurantTable(id: string) {
  const adminUser = await isCurrentUserAdmin();
  const currentTenantId = await getCurrentTenantId();
  const db = adminUser ? createAdmin() : await createServer();

  let query = db.from("restaurant_tables").delete().eq("id", id);

  if (!adminUser) {
    query = query.eq("tenant_id", currentTenantId);
  }

  const { error } = await query;

  if (error) {
    if (isMissingTablesRelation(error)) {
      throw new Error("La tabla restaurant_tables aun no existe en la base de datos. Aplica la migracion pendiente.");
    }
    throw new Error(error.message);
  }

  return { ok: true };
}

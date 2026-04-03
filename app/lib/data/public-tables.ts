import "server-only";

import { createAdmin } from "@/app/lib/supabase";

type TenantRow = {
  id: string;
  name: string;
  domain: string | null;
};

type PublicTableRow = {
  id: string;
  tenant_id: string;
  public_token: string;
  name: string | null;
  number: string | null;
  active: boolean;
};

function isMissingTablesRelation(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return error.code === "42P01" || error.message?.includes('relation "public.restaurant_tables" does not exist') === true;
}

function buildLabel(table: Pick<PublicTableRow, "name" | "number">) {
  if (table.name?.trim()) return table.name.trim();
  if (table.number?.trim()) return `Mesa ${table.number.trim()}`;
  return "Mesa";
}

export async function resolvePublicTableByToken(tableToken: string) {
  const admin = createAdmin();

  const { data, error } = await admin
    .from("restaurant_tables")
    .select("id,tenant_id,public_token,name,number,active")
    .eq("public_token", tableToken)
    .eq("active", true)
    .maybeSingle<PublicTableRow>();

  if (error) {
    if (isMissingTablesRelation(error)) return null;
    throw new Error(error.message);
  }
  if (!data) return null;

  const { data: tenant, error: tenantError } = await admin
    .from("tenants")
    .select("id,name,domain")
    .eq("id", data.tenant_id)
    .maybeSingle<TenantRow>();

  if (tenantError) throw new Error(tenantError.message);
  if (!tenant) return null;

  return {
    table: {
      id: data.id,
      tenant_id: data.tenant_id,
      public_token: data.public_token,
      label: buildLabel(data),
    },
    tenant: {
      id: tenant.id,
      name: tenant.name,
      domain: tenant.domain,
    },
  };
}

export async function createPublicTableEvent(input: {
  tableId: string;
  tenantId: string;
  eventType: string;
  metadata?: Record<string, unknown>;
}) {
  const admin = createAdmin();

  const { error } = await admin.from("table_events").insert({
    table_id: input.tableId,
    tenant_id: input.tenantId,
    event_type: input.eventType,
    metadata: input.metadata ?? {},
  });

  if (error) {
    if (isMissingTablesRelation(error)) {
      throw new Error("La tabla restaurant_tables aun no existe en la base de datos. Aplica la migracion pendiente.");
    }
    throw new Error(error.message);
  }
}

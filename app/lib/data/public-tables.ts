import "server-only";

import { createAdmin } from "@/app/lib/supabase";
import { resolveActiveTableSessionId } from "@/app/lib/data/table-sessions";

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
  salon: string | null;
  active: boolean;
  tenant: TenantRow | TenantRow[] | null;
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
    .select("id,tenant_id,public_token,name,number,salon,active,tenant:tenants(id,name,domain)")
    .eq("public_token", tableToken)
    .maybeSingle<PublicTableRow>();

  if (error) {
    if (isMissingTablesRelation(error)) return null;
    throw new Error(error.message);
  }
  if (!data) return null;

  const tenantValue = Array.isArray(data.tenant) ? data.tenant[0] : data.tenant;
  const tenant = tenantValue ?? null;
  if (!tenant) return null;

  const roomName = data.salon?.trim() || "Salon 1";

  return {
    table: {
      id: data.id,
      tenant_id: data.tenant_id,
      public_token: data.public_token,
      label: buildLabel(data),
      salon: roomName,
      room_name: roomName,
      room: {
        name: roomName,
      },
      active: data.active,
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
  const sessionId = await resolveActiveTableSessionId({
    tenantId: input.tenantId,
    tableId: input.tableId,
  });

  const { error } = await admin.from("table_events").insert({
    table_id: input.tableId,
    tenant_id: input.tenantId,
    session_id: sessionId,
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

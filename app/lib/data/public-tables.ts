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
  tenant: TenantRow | TenantRow[] | null;
};

function buildLabel(table: Pick<PublicTableRow, "name" | "number">) {
  if (table.name?.trim()) return table.name.trim();
  if (table.number?.trim()) return `Mesa ${table.number.trim()}`;
  return "Mesa";
}

export async function resolvePublicTableByToken(tableToken: string) {
  const admin = createAdmin();

  const { data, error } = await admin
    .from("restaurant_tables")
    .select("id,tenant_id,public_token,name,number,active,tenant:tenants(id,name,domain)")
    .eq("public_token", tableToken)
    .eq("active", true)
    .maybeSingle<PublicTableRow>();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const tenantValue = Array.isArray(data.tenant) ? data.tenant[0] ?? null : data.tenant;
  if (!tenantValue) return null;

  return {
    table: {
      id: data.id,
      tenant_id: data.tenant_id,
      public_token: data.public_token,
      label: buildLabel(data),
    },
    tenant: {
      id: tenantValue.id,
      name: tenantValue.name,
      domain: tenantValue.domain,
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

  if (error) throw new Error(error.message);
}

import "server-only";

import { createAdmin } from "@/app/lib/supabase";
import { getCurrentTenantId, getCurrentUser, isCurrentUserAdmin } from "@/app/lib/tenant";

const SERVICE_EVENT_TYPES = new Set(["service", "waiter", "call_waiter", "call_server", "waiter_call", "service_request"]);
const BILL_EVENT_TYPES = new Set(["bill", "account", "check", "request_bill", "bill_request"]);
const ATTENTION_EVENT_TYPES = [...SERVICE_EVENT_TYPES, ...BILL_EVENT_TYPES];

type TableRow = {
  id: string;
  tenant_id: string;
  public_token: string;
  name: string | null;
  number: string | null;
  salon: string | null;
  active: boolean;
};

type TableEventRow = {
  id: number;
  tenant_id: string;
  table_id: string;
  event_type: string;
  created_at: string;
};

export type AttentionTableCard = {
  tableId: string;
  tableToken: string;
  label: string;
  salon: string;
  serviceRequested: boolean;
  billRequested: boolean;
  pendingCount: number;
  latestRequestedAt: string | null;
};

export type AttentionSalonGroup = {
  salon: string;
  tables: AttentionTableCard[];
};

function buildLabel(table: Pick<TableRow, "name" | "number">) {
  if (table.name?.trim()) return table.name.trim();
  if (table.number?.trim()) return `Mesa ${table.number.trim()}`;
  return "Mesa";
}

function classifyEventType(eventType: string) {
  if (SERVICE_EVENT_TYPES.has(eventType)) return "service";
  if (BILL_EVENT_TYPES.has(eventType)) return "bill";
  return "unknown";
}

export async function listAttentionTables(): Promise<AttentionSalonGroup[]> {
  const isAdmin = await isCurrentUserAdmin();
  if (isAdmin) {
    throw new Error("Atencion esta disponible solo para administradores regionales");
  }

  const tenantId = await getCurrentTenantId();
  const db = createAdmin();

  const [{ data: tablesData, error: tablesError }, { data: eventsData, error: eventsError }] = await Promise.all([
    db
      .from("restaurant_tables")
      .select("id,tenant_id,public_token,name,number,salon,active")
      .eq("tenant_id", tenantId)
      .eq("active", true)
      .order("salon", { ascending: true })
      .order("number", { ascending: true }),
    db
      .from("table_events")
      .select("id,tenant_id,table_id,event_type,created_at")
      .eq("tenant_id", tenantId)
      .is("handled_at", null)
      .in("event_type", ATTENTION_EVENT_TYPES)
      .order("created_at", { ascending: false }),
  ]);

  if (tablesError) throw new Error(tablesError.message);
  if (eventsError) throw new Error(eventsError.message);

  const eventsByTable = new Map<string, TableEventRow[]>();
  for (const event of (eventsData ?? []) as TableEventRow[]) {
    eventsByTable.set(event.table_id, [...(eventsByTable.get(event.table_id) ?? []), event]);
  }

  const grouped = new Map<string, AttentionTableCard[]>();
  for (const table of (tablesData ?? []) as TableRow[]) {
    const salon = table.salon?.trim() || "Salon 1";
    const events = eventsByTable.get(table.id) ?? [];
    const card: AttentionTableCard = {
      tableId: table.id,
      tableToken: table.public_token,
      label: buildLabel(table),
      salon,
      serviceRequested: events.some((event) => classifyEventType(event.event_type) === "service"),
      billRequested: events.some((event) => classifyEventType(event.event_type) === "bill"),
      pendingCount: events.length,
      latestRequestedAt: events[0]?.created_at ?? null,
    };

    grouped.set(salon, [...(grouped.get(salon) ?? []), card]);
  }

  return Array.from(grouped.entries())
    .map(([salon, tables]) => ({
      salon,
      tables: tables.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true })),
    }))
    .sort((a, b) => a.salon.localeCompare(b.salon, undefined, { numeric: true }));
}

export async function markTableAttentionHandled(tableId: string) {
  const isAdmin = await isCurrentUserAdmin();
  if (isAdmin) {
    throw new Error("Atencion esta disponible solo para administradores regionales");
  }

  const [tenantId, user] = await Promise.all([getCurrentTenantId(), getCurrentUser()]);
  const db = createAdmin();

  const { data: table, error: tableError } = await db
    .from("restaurant_tables")
    .select("id,tenant_id,public_token")
    .eq("id", tableId)
    .eq("tenant_id", tenantId)
    .maybeSingle<{ id: string; tenant_id: string; public_token: string }>();

  if (tableError) throw new Error(tableError.message);
  if (!table) throw new Error("Mesa no encontrada");

  const { error } = await db
    .from("table_events")
    .update({ handled_at: new Date().toISOString(), handled_by: user.id })
    .eq("tenant_id", tenantId)
    .eq("table_id", tableId)
    .is("handled_at", null)
    .in("event_type", ATTENTION_EVENT_TYPES);

  if (error) throw new Error(error.message);

  return {
    tableId: table.id,
    tableToken: table.public_token,
    tenantId: table.tenant_id,
  };
}

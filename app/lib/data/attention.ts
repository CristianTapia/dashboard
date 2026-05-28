import "server-only";

import { createAdmin } from "@/app/lib/supabase";
import { getCurrentTenantId, getCurrentUser, getTenantAccessContext, isCurrentUserAdmin } from "@/app/lib/tenant";

const SERVICE_EVENT_TYPES = new Set(["service", "waiter", "call_waiter", "call_server", "waiter_call", "service_request"]);
const BILL_EVENT_TYPES = new Set(["bill", "account", "check", "request_bill", "bill_request"]);
const ORDER_EVENT_TYPES = new Set(["order", "order_request", "place_order", "command_order"]);
const ATTENTION_EVENT_TYPES = [...SERVICE_EVENT_TYPES, ...BILL_EVENT_TYPES, ...ORDER_EVENT_TYPES];

type TableRow = {
  id: string;
  tenant_id: string;
  public_token: string;
  name: string | null;
  number: string | null;
  salon: string | null;
  active: boolean;
};

type TenantRow = {
  id: string;
  domain: string | null;
};

type TableEventRow = {
  id: number;
  tenant_id: string;
  table_id: string;
  event_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type StaffAssignmentRow = {
  salon: string | null;
  table_id: string | null;
};

export type AttentionTableCard = {
  tableId: string;
  tableToken: string;
  publicUrl: string;
  label: string;
  number: string | null;
  name: string | null;
  salon: string;
  serviceRequested: boolean;
  billRequested: boolean;
  orderRequested: boolean;
  orderSummary: string | null;
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

function getMenuBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_MENU_BASE_URL;
  if (baseUrl) return baseUrl.replace(/\/+$/, "");

  return "https://menu.lab3c.app";
}

function classifyEventType(eventType: string) {
  if (SERVICE_EVENT_TYPES.has(eventType)) return "service";
  if (BILL_EVENT_TYPES.has(eventType)) return "bill";
  if (ORDER_EVENT_TYPES.has(eventType)) return "order";
  return "unknown";
}

function extractOrderSummary(metadata: Record<string, unknown> | null | undefined) {
  if (!metadata) return null;
  const possibleItems = metadata.items ?? metadata.cart ?? metadata.products ?? metadata.orderItems;
  if (!Array.isArray(possibleItems) || possibleItems.length === 0) return null;

  const labels = possibleItems
    .slice(0, 3)
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const name = row.name ?? row.title ?? row.productName ?? row.product_name;
      const quantity = row.quantity ?? row.qty ?? row.count;
      if (typeof name !== "string" || !name.trim()) return null;
      return `${typeof quantity === "number" && quantity > 1 ? `${quantity}x ` : ""}${name.trim()}`;
    })
    .filter(Boolean);

  if (labels.length === 0) return null;
  const extraCount = possibleItems.length - labels.length;
  return `${labels.join(", ")}${extraCount > 0 ? ` y ${extraCount} mas` : ""}`;
}

export async function listAttentionTables(): Promise<AttentionSalonGroup[]> {
  const isAdmin = await isCurrentUserAdmin();
  if (isAdmin) {
    throw new Error("Atencion esta disponible solo para administradores regionales");
  }

  const tenantId = await getCurrentTenantId();
  const user = await getCurrentUser();
  const tenantCtx = await getTenantAccessContext();
  const db = createAdmin();
  const { data: tenantData, error: tenantError } = await db
    .from("tenants")
    .select("id,domain")
    .eq("id", tenantId)
    .maybeSingle<TenantRow>();
  if (tenantError) throw new Error(tenantError.message);

  const tenantKey = tenantData?.domain?.trim() || tenantData?.id || tenantId;
  const menuBaseUrl = getMenuBaseUrl();

  const [
    { data: tablesData, error: tablesError },
    { data: eventsData, error: eventsError },
    { data: assignmentsData, error: assignmentsError },
  ] = await Promise.all([
    db
      .from("restaurant_tables")
      .select("id,tenant_id,public_token,name,number,salon,active")
      .eq("tenant_id", tenantId)
      .eq("active", true)
      .order("salon", { ascending: true })
      .order("number", { ascending: true }),
    db
      .from("table_events")
      .select("id,tenant_id,table_id,event_type,metadata,created_at")
      .eq("tenant_id", tenantId)
      .is("handled_at", null)
      .in("event_type", ATTENTION_EVENT_TYPES)
      .order("created_at", { ascending: false }),
    tenantCtx.isTenantAdmin
      ? Promise.resolve({ data: [] as StaffAssignmentRow[], error: null })
      : db
          .from("tenant_staff_assignments")
          .select("salon,table_id")
          .eq("tenant_id", tenantId)
          .eq("user_id", user.id),
  ]);

  if (tablesError) throw new Error(tablesError.message);
  if (eventsError) throw new Error(eventsError.message);
  if (assignmentsError) throw new Error(assignmentsError.message);

  const assignments = (assignmentsData ?? []) as StaffAssignmentRow[];
  const assignedSalons = new Set(assignments.map((assignment) => assignment.salon).filter(Boolean) as string[]);
  const assignedTableIds = new Set(assignments.map((assignment) => assignment.table_id).filter(Boolean) as string[]);
  const hasAssignments = assignedSalons.size > 0 || assignedTableIds.size > 0;

  const eventsByTable = new Map<string, TableEventRow[]>();
  for (const event of (eventsData ?? []) as TableEventRow[]) {
    eventsByTable.set(event.table_id, [...(eventsByTable.get(event.table_id) ?? []), event]);
  }

  const grouped = new Map<string, AttentionTableCard[]>();
  for (const table of (tablesData ?? []) as TableRow[]) {
    const salon = table.salon?.trim() || "Salon 1";
    if (!tenantCtx.isTenantAdmin && hasAssignments && !assignedTableIds.has(table.id) && !assignedSalons.has(salon)) {
      continue;
    }

    const events = eventsByTable.get(table.id) ?? [];
    const latestOrderEvent = events.find((event) => classifyEventType(event.event_type) === "order");
    const card: AttentionTableCard = {
      tableId: table.id,
      tableToken: table.public_token,
      publicUrl: `${menuBaseUrl}/${encodeURIComponent(tenantKey)}/${encodeURIComponent(table.public_token)}`,
      label: buildLabel(table),
      number: table.number,
      name: table.name,
      salon,
      serviceRequested: events.some((event) => classifyEventType(event.event_type) === "service"),
      billRequested: events.some((event) => classifyEventType(event.event_type) === "bill"),
      orderRequested: events.some((event) => classifyEventType(event.event_type) === "order"),
      orderSummary: extractOrderSummary(latestOrderEvent?.metadata) ?? (latestOrderEvent ? "Comanda recibida desde el menu" : null),
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

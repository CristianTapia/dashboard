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
  handled_at?: string | null;
  handled_by?: string | null;
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
  orderItemSummary: Array<{
    name: string;
    quantity: number;
  }>;
  orderRequests: Array<{
    id: number;
    summary: string;
    receivedAt: string;
  }>;
  pendingCount: number;
  latestRequestedAt: string | null;
};

export type AttentionSalonGroup = {
  salon: string;
  tables: AttentionTableCard[];
};

export type RecentlyHandledAttention = {
  tableId: string;
  tableToken: string;
  label: string;
  salon: string;
  handledAt: string;
  pendingCount: number;
  summary: string;
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

function extractOrderItems(metadata: Record<string, unknown> | null | undefined) {
  if (!metadata) return [];
  const possibleItems = metadata.items ?? metadata.cart ?? metadata.products ?? metadata.orderItems;
  if (!Array.isArray(possibleItems) || possibleItems.length === 0) return [];

  return possibleItems
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const name = row.name ?? row.title ?? row.productName ?? row.product_name;
      const quantity = row.quantity ?? row.qty ?? row.count;
      const normalizedQuantity =
        typeof quantity === "number" ? quantity : typeof quantity === "string" ? Number(quantity) : 1;

      if (typeof name !== "string" || !name.trim()) return null;
      if (!Number.isFinite(normalizedQuantity) || normalizedQuantity <= 0) return null;

      return {
        name: name.trim(),
        quantity: normalizedQuantity,
      };
    })
    .filter((item): item is { name: string; quantity: number } => Boolean(item));
}

function buildOrderItemSummary(orderEvents: TableEventRow[]) {
  const summary = new Map<string, { name: string; quantity: number }>();

  for (const event of orderEvents) {
    for (const item of extractOrderItems(event.metadata)) {
      const key = item.name.toLowerCase();
      const current = summary.get(key) ?? { name: item.name, quantity: 0 };
      summary.set(key, { ...current, quantity: current.quantity + item.quantity });
    }
  }

  return Array.from(summary.values()).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}

function buildHandledSummary(events: TableEventRow[]) {
  const orderEvents = events.filter((event) => classifyEventType(event.event_type) === "order");
  const orderSummary = buildOrderItemSummary(orderEvents);

  if (orderSummary.length > 0) {
    return orderSummary
      .slice(0, 4)
      .map((item) => `${item.quantity}x ${item.name}`)
      .join(", ");
  }

  const hasService = events.some((event) => classifyEventType(event.event_type) === "service");
  const hasBill = events.some((event) => classifyEventType(event.event_type) === "bill");
  const parts = [hasService ? "Servicio" : null, hasBill ? "Cuenta" : null].filter(Boolean);
  return parts.join(", ") || "Atencion";
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
    const orderEvents = events.filter((event) => classifyEventType(event.event_type) === "order");
    const chronologicalOrderEvents = [...orderEvents].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
    const latestOrderEvent = orderEvents[0] ?? null;
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
      orderItemSummary: buildOrderItemSummary(orderEvents),
      orderRequests: chronologicalOrderEvents.map((event) => ({
        id: event.id,
        summary: extractOrderSummary(event.metadata) ?? "Comanda recibida desde el menu",
        receivedAt: event.created_at,
      })),
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

export async function listRecentlyHandledAttentionTables(): Promise<RecentlyHandledAttention[]> {
  const isAdmin = await isCurrentUserAdmin();
  if (isAdmin) {
    throw new Error("Atencion esta disponible solo para administradores regionales");
  }

  const tenantId = await getCurrentTenantId();
  const user = await getCurrentUser();
  const tenantCtx = await getTenantAccessContext();
  const db = createAdmin();
  const windowStart = new Date(Date.now() - 15 * 60_000).toISOString();

  const [
    { data: tablesData, error: tablesError },
    { data: eventsData, error: eventsError },
    { data: assignmentsData, error: assignmentsError },
  ] = await Promise.all([
    db
      .from("restaurant_tables")
      .select("id,tenant_id,public_token,name,number,salon,active")
      .eq("tenant_id", tenantId)
      .eq("active", true),
    db
      .from("table_events")
      .select("id,tenant_id,table_id,event_type,metadata,created_at,handled_at,handled_by")
      .eq("tenant_id", tenantId)
      .gte("handled_at", windowStart)
      .in("event_type", ATTENTION_EVENT_TYPES)
      .order("handled_at", { ascending: false }),
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

  const tablesById = new Map(((tablesData ?? []) as TableRow[]).map((table) => [table.id, table]));
  const assignments = (assignmentsData ?? []) as StaffAssignmentRow[];
  const assignedSalons = new Set(assignments.map((assignment) => assignment.salon).filter(Boolean) as string[]);
  const assignedTableIds = new Set(assignments.map((assignment) => assignment.table_id).filter(Boolean) as string[]);
  const hasAssignments = assignedSalons.size > 0 || assignedTableIds.size > 0;

  const eventsByTable = new Map<string, TableEventRow[]>();
  for (const event of (eventsData ?? []) as TableEventRow[]) {
    const table = tablesById.get(event.table_id);
    if (!table) continue;

    const salon = table.salon?.trim() || "Salon 1";
    if (!tenantCtx.isTenantAdmin && hasAssignments && !assignedTableIds.has(table.id) && !assignedSalons.has(salon)) {
      continue;
    }

    eventsByTable.set(event.table_id, [...(eventsByTable.get(event.table_id) ?? []), event]);
  }

  return Array.from(eventsByTable.entries())
    .map(([tableId, events]) => {
      const table = tablesById.get(tableId);
      if (!table) return null;
      const handledAt = events
        .map((event) => event.handled_at)
        .filter((value): value is string => Boolean(value))
        .sort((a, b) => Date.parse(b) - Date.parse(a))[0];
      if (!handledAt) return null;

      return {
        tableId: table.id,
        tableToken: table.public_token,
        label: buildLabel(table),
        salon: table.salon?.trim() || "Salon 1",
        handledAt,
        pendingCount: events.length,
        summary: buildHandledSummary(events),
      } satisfies RecentlyHandledAttention;
    })
    .filter((item): item is RecentlyHandledAttention => Boolean(item))
    .sort((a, b) => Date.parse(b.handledAt) - Date.parse(a.handledAt))
    .slice(0, 8);
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

export async function reopenRecentlyHandledTableAttention(tableId: string) {
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

  const undoWindowStart = new Date(Date.now() - 15 * 60_000).toISOString();
  const { error } = await db
    .from("table_events")
    .update({ handled_at: null, handled_by: null })
    .eq("tenant_id", tenantId)
    .eq("table_id", tableId)
    .eq("handled_by", user.id)
    .gte("handled_at", undoWindowStart)
    .in("event_type", ATTENTION_EVENT_TYPES);

  if (error) throw new Error(error.message);

  return {
    tableId: table.id,
    tableToken: table.public_token,
    tenantId: table.tenant_id,
  };
}

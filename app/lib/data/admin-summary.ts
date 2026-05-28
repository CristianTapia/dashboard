import "server-only";

import { createAdmin } from "@/app/lib/supabase";
import { getCurrentTenantId, getTenantAccessContext } from "@/app/lib/tenant";

const SERVICE_EVENT_TYPES = new Set(["service", "waiter", "call_waiter", "call_server", "waiter_call", "service_request"]);
const BILL_EVENT_TYPES = new Set(["bill", "account", "check", "request_bill", "bill_request"]);
const ORDER_EVENT_TYPES = new Set(["order", "order_request", "place_order", "command_order"]);
const ATTENTION_EVENT_TYPES = new Set([...SERVICE_EVENT_TYPES, ...BILL_EVENT_TYPES, ...ORDER_EVENT_TYPES]);

type EventRow = {
  id: number;
  tenant_id: string;
  table_id: string;
  event_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  handled_at: string | null;
  handled_by: string | null;
};

type TenantRow = {
  id: string;
  name: string;
  active: boolean | null;
};

type TableRow = {
  id: string;
  tenant_id: string;
  name: string | null;
  number: string | null;
  salon: string | null;
  active: boolean | null;
};

type ProductRow = {
  id: number;
  tenant_id: string;
  active: boolean | null;
};

type Leader = {
  label: string;
  value: number;
  detail?: string;
};

export type GlobalAdminSummary = {
  kind: "global";
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  products: number;
  activeProducts: number;
  categories: number;
  highlights: number;
  activeHighlights: number;
  inactiveHighlights: number;
  tables: number;
  eventsLast7Days: number;
  activeTenantsLast30Days: number;
  ordersLast30Days: number;
  estimatedRevenueLast30Days: number;
  pendingAttention: number;
  averageResponseMinutesLast30Days: number | null;
  topTenants: Leader[];
};

export type TenantAdminSummary = {
  kind: "tenant";
  tenantName: string;
  totalTables: number;
  activeTables: number;
  activeProducts: number;
  ordersToday: number;
  ordersLast30Days: number;
  estimatedRevenueToday: number;
  estimatedRevenueLast30Days: number;
  serviceRequestsToday: number;
  billRequestsToday: number;
  pendingAttention: number;
  averageResponseMinutesToday: number | null;
  averageResponseMinutesLast30Days: number | null;
  topProductByQuantity: Leader | null;
  topProductByRevenue: Leader | null;
  topTableByAttention: Leader | null;
  topTableByRevenue: Leader | null;
  topTablesByRevenue: Leader[];
  peakHour: Leader | null;
};

export type DashboardSummary = GlobalAdminSummary | TenantAdminSummary;

async function countRows(table: string, filters: Record<string, unknown> = {}) {
  const admin = createAdmin();
  let query = admin.from(table).select("*", { count: "exact", head: true });

  for (const [key, value] of Object.entries(filters)) {
    query = query.eq(key, value);
  }

  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function classifyEvent(eventType: string) {
  if (ORDER_EVENT_TYPES.has(eventType)) return "order";
  if (SERVICE_EVENT_TYPES.has(eventType)) return "service";
  if (BILL_EVENT_TYPES.has(eventType)) return "bill";
  return "other";
}

function getOrderItems(metadata: Record<string, unknown> | null | undefined) {
  const rawItems = metadata?.items ?? metadata?.cart ?? metadata?.products ?? metadata?.orderItems;
  if (!Array.isArray(rawItems)) return [];

  return rawItems
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const rawId = row.id ?? row.productId ?? row.product_id;
      const rawName = row.name ?? row.title ?? row.productName ?? row.product_name;
      const rawQuantity = row.quantity ?? row.qty ?? row.count ?? 1;
      const rawLineTotal = row.lineTotal ?? row.line_total;
      const rawPrice = row.price;

      const id = typeof rawId === "number" || typeof rawId === "string" ? String(rawId) : "";
      const name = typeof rawName === "string" && rawName.trim() ? rawName.trim() : id ? `Producto ${id}` : null;
      const quantity =
        typeof rawQuantity === "number" ? rawQuantity : typeof rawQuantity === "string" ? Number(rawQuantity) : 1;
      const price = typeof rawPrice === "number" ? rawPrice : typeof rawPrice === "string" ? Number(rawPrice) : 0;
      const lineTotal =
        typeof rawLineTotal === "number"
          ? rawLineTotal
          : typeof rawLineTotal === "string"
            ? Number(rawLineTotal)
            : price * quantity;

      if (!name || !Number.isFinite(quantity) || quantity <= 0) return null;

      return {
        id,
        name,
        quantity,
        lineTotal: Number.isFinite(lineTotal) ? lineTotal : 0,
      };
    })
    .filter((item): item is { id: string; name: string; quantity: number; lineTotal: number } => Boolean(item));
}

function getOrderTotal(metadata: Record<string, unknown> | null | undefined) {
  const rawTotal = metadata?.total;
  if (typeof rawTotal === "number" && Number.isFinite(rawTotal)) return rawTotal;
  if (typeof rawTotal === "string") {
    const parsed = Number(rawTotal);
    if (Number.isFinite(parsed)) return parsed;
  }

  return getOrderItems(metadata).reduce((sum, item) => sum + item.lineTotal, 0);
}

function averageResponseMinutes(events: EventRow[]) {
  const durations = events
    .map((event) => {
      if (!event.handled_at) return null;
      const createdAt = Date.parse(event.created_at);
      const handledAt = Date.parse(event.handled_at);
      if (!Number.isFinite(createdAt) || !Number.isFinite(handledAt) || handledAt < createdAt) return null;
      return (handledAt - createdAt) / 60_000;
    })
    .filter((value): value is number => value !== null);

  if (durations.length === 0) return null;
  return durations.reduce((sum, value) => sum + value, 0) / durations.length;
}

function tableLabel(table: TableRow | undefined) {
  if (!table) return "Mesa eliminada";
  if (table.name?.trim()) return table.name.trim();
  if (table.number?.trim()) return `Mesa ${table.number.trim()}`;
  return "Mesa";
}

function topFromMap(map: Map<string, Leader>) {
  return Array.from(map.values()).sort((a, b) => b.value - a.value)[0] ?? null;
}

function topListFromMap(map: Map<string, Leader>, limit = 5) {
  return Array.from(map.values())
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

async function getRecentEvents(days: number, tenantId?: string) {
  const admin = createAdmin();
  let query = admin
    .from("table_events")
    .select("id,tenant_id,table_id,event_type,metadata,created_at,handled_at,handled_by")
    .gte("created_at", daysAgo(days).toISOString())
    .order("created_at", { ascending: false })
    .limit(5000);

  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as EventRow[];
}

async function listTables(tenantId?: string) {
  const admin = createAdmin();
  let query = admin.from("restaurant_tables").select("id,tenant_id,name,number,salon,active");
  if (tenantId) query = query.eq("tenant_id", tenantId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as TableRow[];
}

async function listProducts(tenantId?: string) {
  const admin = createAdmin();
  let query = admin.from("products").select("id,tenant_id,active");
  if (tenantId) query = query.eq("tenant_id", tenantId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as ProductRow[];
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const ctx = await getTenantAccessContext();

  if (ctx.isAdmin) {
    return getGlobalAdminSummary();
  }

  if (!ctx.isTenantAdmin) {
    throw new Error("Permisos insuficientes para ver metricas");
  }

  return getTenantAdminSummary();
}

async function getGlobalAdminSummary(): Promise<GlobalAdminSummary> {
  const admin = createAdmin();
  const [
    totalTenants,
    activeTenants,
    inactiveTenants,
    products,
    activeProducts,
    categories,
    highlights,
    activeHighlights,
    tables,
    events,
    pendingAttention,
    tenantsResult,
  ] = await Promise.all([
    countRows("tenants"),
    countRows("tenants", { active: true }),
    countRows("tenants", { active: false }),
    countRows("products"),
    countRows("products", { active: true }),
    countRows("categories"),
    countRows("highlights"),
    countRows("highlights", { active: true }),
    countRows("restaurant_tables"),
    getRecentEvents(30),
    countPendingAttention(),
    admin.from("tenants").select("id,name,active"),
  ]);

  if (tenantsResult.error) throw new Error(tenantsResult.error.message);

  const tenants = new Map(((tenantsResult.data ?? []) as TenantRow[]).map((tenant) => [tenant.id, tenant]));
  const sevenDaysAgo = daysAgo(7).getTime();
  const tenantLeaders = new Map<string, Leader & { orders: number; revenue: number }>();

  let eventsLast7Days = 0;
  let ordersLast30Days = 0;
  let estimatedRevenueLast30Days = 0;
  const activeTenantIdsLast30Days = new Set<string>();

  for (const event of events) {
    const createdAt = Date.parse(event.created_at);
    if (createdAt >= sevenDaysAgo) eventsLast7Days += 1;

    activeTenantIdsLast30Days.add(event.tenant_id);
    const tenant = tenants.get(event.tenant_id);
    const current = tenantLeaders.get(event.tenant_id) ?? {
      label: tenant?.name ?? "Tenant eliminado",
      value: 0,
      detail: "0 pedidos",
      orders: 0,
      revenue: 0,
    };

    current.value += 1;

    if (classifyEvent(event.event_type) === "order") {
      const total = getOrderTotal(event.metadata);
      ordersLast30Days += 1;
      estimatedRevenueLast30Days += total;
      current.orders += 1;
      current.revenue += total;
      current.detail = `${current.orders} pedidos`;
    }

    tenantLeaders.set(event.tenant_id, current);
  }

  return {
    kind: "global",
    totalTenants,
    activeTenants,
    inactiveTenants,
    products,
    activeProducts,
    categories,
    highlights,
    activeHighlights,
    inactiveHighlights: Math.max(0, highlights - activeHighlights),
    tables,
    eventsLast7Days,
    activeTenantsLast30Days: activeTenantIdsLast30Days.size,
    ordersLast30Days,
    estimatedRevenueLast30Days,
    pendingAttention,
    averageResponseMinutesLast30Days: averageResponseMinutes(events.filter((event) => ATTENTION_EVENT_TYPES.has(event.event_type))),
    topTenants: Array.from(tenantLeaders.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .map((tenant) => ({
        label: tenant.label,
        value: tenant.value,
        detail: `${tenant.orders} pedidos - ${formatCompactCurrency(tenant.revenue)}`,
      })),
  };
}

async function countPendingAttention(tenantId?: string) {
  const admin = createAdmin();
  let query = admin
    .from("table_events")
    .select("*", { count: "exact", head: true })
    .is("handled_at", null)
    .in("event_type", Array.from(ATTENTION_EVENT_TYPES));

  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  }

  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function getTenantAdminSummary(): Promise<TenantAdminSummary> {
  const tenantId = await getCurrentTenantId();
  const admin = createAdmin();
  const [{ data: tenant, error: tenantError }, events, tables, products, pendingAttention] = await Promise.all([
    admin.from("tenants").select("id,name,active").eq("id", tenantId).maybeSingle<TenantRow>(),
    getRecentEvents(30, tenantId),
    listTables(tenantId),
    listProducts(tenantId),
    countPendingAttention(tenantId),
  ]);

  if (tenantError) throw new Error(tenantError.message);

  const todayStart = startOfToday().getTime();
  const tablesById = new Map(tables.map((table) => [table.id, table]));
  const quantityByProduct = new Map<string, Leader>();
  const revenueByProduct = new Map<string, Leader>();
  const attentionByTable = new Map<string, Leader>();
  const revenueByTable = new Map<string, Leader>();
  const ordersByTable = new Map<string, Leader>();
  const eventsByHour = new Map<string, Leader>();

  let ordersToday = 0;
  let ordersLast30Days = 0;
  let estimatedRevenueToday = 0;
  let estimatedRevenueLast30Days = 0;
  let serviceRequestsToday = 0;
  let billRequestsToday = 0;

  for (const event of events) {
    const createdAt = Date.parse(event.created_at);
    const isToday = createdAt >= todayStart;
    const eventKind = classifyEvent(event.event_type);
    const table = tablesById.get(event.table_id);
    const label = tableLabel(table);

    const hour = Number.isFinite(createdAt) ? new Date(createdAt).getHours() : null;
    if (hour !== null) {
      const hourKey = String(hour).padStart(2, "0");
      const current = eventsByHour.get(hourKey) ?? { label: `${hourKey}:00`, value: 0, detail: "eventos" };
      eventsByHour.set(hourKey, { ...current, value: current.value + 1 });
    }

    if (eventKind === "service") {
      if (isToday) serviceRequestsToday += 1;
      const current = attentionByTable.get(event.table_id) ?? { label, value: 0, detail: table?.salon ?? "Salon" };
      attentionByTable.set(event.table_id, { ...current, value: current.value + 1 });
    }

    if (eventKind === "bill" && isToday) {
      billRequestsToday += 1;
    }

    if (eventKind !== "order") continue;

    const total = getOrderTotal(event.metadata);
    ordersLast30Days += 1;
    estimatedRevenueLast30Days += total;

    const currentRevenueTable = revenueByTable.get(event.table_id) ?? { label, value: 0, detail: table?.salon ?? "Salon" };
    revenueByTable.set(event.table_id, { ...currentRevenueTable, value: currentRevenueTable.value + total });

    const currentOrdersTable = ordersByTable.get(event.table_id) ?? { label, value: 0, detail: table?.salon ?? "Salon" };
    ordersByTable.set(event.table_id, { ...currentOrdersTable, value: currentOrdersTable.value + 1 });

    if (isToday) {
      ordersToday += 1;
      estimatedRevenueToday += total;
    }

    for (const item of getOrderItems(event.metadata)) {
      const productKey = item.id || item.name.toLowerCase();
      const quantityCurrent = quantityByProduct.get(productKey) ?? { label: item.name, value: 0, detail: "unidades" };
      quantityByProduct.set(productKey, { ...quantityCurrent, value: quantityCurrent.value + item.quantity });

      const revenueCurrent = revenueByProduct.get(productKey) ?? { label: item.name, value: 0, detail: "venta estimada" };
      revenueByProduct.set(productKey, { ...revenueCurrent, value: revenueCurrent.value + item.lineTotal });
    }
  }

  return {
    kind: "tenant",
    tenantName: tenant?.name ?? "Restaurant",
    totalTables: tables.length,
    activeTables: tables.filter((table) => table.active !== false).length,
    activeProducts: products.filter((product) => product.active !== false).length,
    ordersToday,
    ordersLast30Days,
    estimatedRevenueToday,
    estimatedRevenueLast30Days,
    serviceRequestsToday,
    billRequestsToday,
    pendingAttention,
    averageResponseMinutesToday: averageResponseMinutes(
      events.filter((event) => Date.parse(event.created_at) >= todayStart && ATTENTION_EVENT_TYPES.has(event.event_type)),
    ),
    averageResponseMinutesLast30Days: averageResponseMinutes(events.filter((event) => ATTENTION_EVENT_TYPES.has(event.event_type))),
    topProductByQuantity: topFromMap(quantityByProduct),
    topProductByRevenue: topFromMap(revenueByProduct),
    topTableByAttention: topFromMap(attentionByTable),
    topTableByRevenue: topFromMap(revenueByTable),
    topTablesByRevenue: topListFromMap(revenueByTable, 5),
    peakHour: topFromMap(eventsByHour),
  };
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
    notation: value >= 1_000_000 ? "compact" : "standard",
  }).format(value);
}

import type { ReactNode } from "react";
import {
  BadgePercent,
  BellRing,
  Building2,
  Clock3,
  ConciergeBell,
  Layers3,
  Package,
  ReceiptText,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";

import { getDashboardSummary, type DashboardSummary } from "@/app/lib/data/admin-summary";
import MetricsRefreshButton from "@/app/ui/MetricsRefreshButton";

export const dynamic = "force-dynamic";

function StatCard({
  title,
  value,
  detail,
  icon,
}: {
  title: string;
  value: ReactNode;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--color-txt-secondary)]">{title}</p>
          <p className="mt-2 truncate text-3xl font-semibold">{value}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-bg-selected)] text-[var(--color-txt-selected)]">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-sm text-[var(--color-txt-secondary)]">{detail}</p>
    </div>
  );
}

function LeaderList({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: Array<{ label: string; value: number; detail?: string }>;
  emptyText: string;
}) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <section className="rounded-xl border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-4 shadow-card">
      <h2 className="text-base font-semibold">{title}</h2>
      {items.length > 0 ? (
        <div className="mt-4 space-y-3">
          {items.map((item, index) => (
            <div key={`${item.label}-${index}`} className="min-w-0">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium">{item.label}</span>
                <span className="shrink-0 font-semibold">{formatNumber(item.value)}</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--color-bg-selected)]">
                <div
                  className="h-full rounded-full bg-[var(--color-button-send)]"
                  style={{ width: `${Math.max(8, (item.value / maxValue) * 100)}%` }}
                />
              </div>
              {item.detail ? <p className="mt-1 text-xs text-[var(--color-txt-secondary)]">{item.detail}</p> : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-dashed border-[var(--color-border-box)] p-4 text-sm text-[var(--color-txt-secondary)]">
          {emptyText}
        </p>
      )}
    </section>
  );
}

export default async function Overview() {
  const summary = await getDashboardSummary();
  const updatedAtLabel = formatTime(new Date());

  return (
    <div className="flex flex-col p-2 sm:p-4">
      {summary.kind === "global" ? (
        <GlobalSummary summary={summary} updatedAtLabel={updatedAtLabel} />
      ) : (
        <TenantSummary summary={summary} updatedAtLabel={updatedAtLabel} />
      )}
    </div>
  );
}

function GlobalSummary({
  summary,
  updatedAtLabel,
}: {
  summary: Extract<DashboardSummary, { kind: "global" }>;
  updatedAtLabel: string;
}) {
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col items-start gap-1.5">
          <h1 className="text-2xl font-semibold sm:text-[1.7rem]">Resumen global</h1>
          <p className="max-w-2xl text-sm leading-6 text-[var(--color-txt-secondary)]">
            Salud general de la plataforma, adopcion de tenants y uso del menu digital.
          </p>
        </div>
        <MetricsRefreshButton updatedAtLabel={updatedAtLabel} />
      </div>

      <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 sm:gap-6">
        <StatCard
          title="Tenants"
          value={summary.totalTenants}
          detail={`${summary.activeTenants} activos - ${summary.inactiveTenants} inactivos`}
          icon={<Building2 size={20} />}
        />
        <StatCard
          title="Tenants activos 30d"
          value={summary.activeTenantsLast30Days}
          detail="Con al menos un evento registrado"
          icon={<TrendingUp size={20} />}
        />
        <StatCard
          title="Eventos 7d"
          value={summary.eventsLast7Days}
          detail="Pedidos, atención y cuenta"
          icon={<BellRing size={20} />}
        />
        <StatCard
          title="Pedidos 30d"
          value={summary.ordersLast30Days}
          detail={formatCurrency(summary.estimatedRevenueLast30Days)}
          icon={<ReceiptText size={20} />}
        />
        <StatCard
          title="Pendientes"
          value={summary.pendingAttention}
          detail="Eventos de atencion sin resolver"
          icon={<ConciergeBell size={20} />}
        />
        <StatCard
          title="Respuesta promedio"
          value={formatMinutes(summary.averageResponseMinutesLast30Days)}
          detail="Promedio de atenciones resueltas en 30d"
          icon={<Clock3 size={20} />}
        />
        <StatCard
          title="Productos"
          value={summary.products}
          detail={`${summary.activeProducts} activos`}
          icon={<Package size={20} />}
        />
        <StatCard
          title="Categorias"
          value={summary.categories}
          detail="Organizacion de menus"
          icon={<Layers3 size={20} />}
        />
        <StatCard
          title="Destacados"
          value={summary.highlights}
          detail={`${summary.activeHighlights} activos - ${summary.inactiveHighlights} inactivos`}
          icon={<BadgePercent size={20} />}
        />
        <StatCard
          title="Mesas"
          value={summary.tables}
          detail="Links publicos y QR configurados"
          icon={<ConciergeBell size={20} />}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LeaderList
          title="Tenants con mas uso en 30 dias"
          items={summary.topTenants}
          emptyText="Aun no hay eventos suficientes para generar ranking."
        />
      </div>
    </>
  );
}

function TenantSummary({
  summary,
  updatedAtLabel,
}: {
  summary: Extract<DashboardSummary, { kind: "tenant" }>;
  updatedAtLabel: string;
}) {
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col items-start gap-1.5">
          <h1 className="text-2xl font-semibold sm:text-[1.7rem]">Resumen de {summary.tenantName}</h1>
          <p className="max-w-2xl text-sm leading-6 text-[var(--color-txt-secondary)]">
            Métricas operativas para pedidos, mesas, atención y consumo estimado del restaurant.
          </p>
        </div>
        <MetricsRefreshButton updatedAtLabel={updatedAtLabel} />
      </div>

      <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 sm:gap-6">
        <StatCard
          title="Venta de hoy"
          value={formatCurrency(summary.estimatedRevenueToday)}
          detail={`${summary.ordersToday} pedidos recibidos`}
          icon={<TrendingUp size={20} />}
        />
        <StatCard
          title="Venta a 30 días"
          value={formatCurrency(summary.estimatedRevenueLast30Days)}
          detail={`${summary.ordersLast30Days} pedidos desde el menu`}
          icon={<ReceiptText size={20} />}
        />
        <StatCard
          title="Atencion de hoy"
          value={summary.serviceRequestsToday}
          detail="Llamados al garzon"
          icon={<BellRing size={20} />}
        />
        <StatCard
          title="Cuentas de hoy"
          value={summary.billRequestsToday}
          detail="Clientes que solicitaron pagar"
          icon={<ReceiptText size={20} />}
        />
        <StatCard
          title="Solicitudes Pendientes"
          value={summary.pendingAttention}
          detail="Solicitudes sin marcar como atendidas"
          icon={<ConciergeBell size={20} />}
        />
        <StatCard
          title="Respuestas de hoy"
          value={formatMinutes(summary.averageResponseMinutesToday)}
          detail={`30d: ${formatMinutes(summary.averageResponseMinutesLast30Days)}`}
          icon={<Clock3 size={20} />}
        />
        <StatCard
          title="Producto más pedido"
          value={summary.topProductByQuantity?.label ?? "Sin datos"}
          detail={
            summary.topProductByQuantity
              ? `${formatNumber(summary.topProductByQuantity.value)} unidades en 30d`
              : "Sin pedidos registrados"
          }
          icon={<UtensilsCrossed size={20} />}
        />
        <StatCard
          title="Producto de mayor venta"
          value={summary.topProductByRevenue?.label ?? "Sin datos"}
          detail={
            summary.topProductByRevenue ? formatCurrency(summary.topProductByRevenue.value) : "Sin pedidos registrados"
          }
          icon={<Package size={20} />}
        />
        <StatCard
          title="Mesa más activa"
          value={summary.topTableByAttention?.label ?? "Sin datos"}
          detail={
            summary.topTableByAttention
              ? `${formatNumber(summary.topTableByAttention.value)} llamados en 30d`
              : "Sin llamados registrados"
          }
          icon={<ConciergeBell size={20} />}
        />
        <StatCard
          title="Hora peak"
          value={summary.peakHour?.label ?? "Sin datos"}
          detail={
            summary.peakHour ? `${formatNumber(summary.peakHour.value)} eventos en 30d` : "Sin eventos registrados"
          }
          icon={<Clock3 size={20} />}
        />
        <StatCard
          title="Mesas"
          value={summary.totalTables}
          detail={`${summary.activeTables} activas`}
          icon={<ConciergeBell size={20} />}
        />
        <StatCard
          title="Productos activos"
          value={summary.activeProducts}
          detail="Disponibles para el menu"
          icon={<Package size={20} />}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LeaderList
          title="Consumo de mesas 30 días"
          items={summary.topTablesByRevenue.map((item) => ({
            ...item,
            detail: item.detail ? `${item.detail} - ${formatCurrency(item.value)}` : formatCurrency(item.value),
          }))}
          emptyText="Aun no hay pedidos para calcular consumo por mesa."
        />
        <LeaderList
          title="Mesa con más llamados"
          items={summary.topTableByAttention ? [summary.topTableByAttention] : []}
          emptyText="Aun no hay llamados de atencion registrados."
        />
      </div>

      <p className="mt-5 text-xs leading-5 text-[var(--color-txt-secondary)]">
        La venta es estimada: se calcula desde comandas enviadas por el menu, no desde pagos cerrados o anulaciones.
      </p>
    </>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 }).format(value);
}

function formatMinutes(value: number | null) {
  if (value === null) return "Sin datos";
  if (value < 1) return "< 1 min";
  return `${Math.round(value)} min`;
}

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

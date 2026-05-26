import type { ReactNode } from "react";
import { Building2, Layers3, Megaphone, Package, Table2 } from "lucide-react";

import { requireAdmin } from "@/app/lib/auth";
import { getAdminSummary } from "@/app/lib/data/admin-summary";

function StatCard({
  title,
  value,
  detail,
  icon,
}: {
  title: string;
  value: number;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--color-txt-secondary)]">{title}</p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-bg-selected)] text-[var(--color-txt-selected)]">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-sm text-[var(--color-txt-secondary)]">{detail}</p>
    </div>
  );
}

export default async function Overview() {
  await requireAdmin();
  const summary = await getAdminSummary();

  return (
    <div className="flex flex-col p-2 sm:p-4">
      <div className="flex flex-col items-start gap-1.5">
        <h1 className="text-2xl font-semibold sm:text-[1.7rem]">Resumen global</h1>
        <p className="max-w-2xl text-sm leading-6 text-[var(--color-txt-secondary)]">
          Vista general de tenants y contenido publicado en el dashboard.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 sm:gap-6">
        <StatCard
          title="Tenants"
          value={summary.totalTenants}
          detail={`${summary.activeTenants} activos · ${summary.inactiveTenants} inactivos`}
          icon={<Building2 size={20} />}
        />
        <StatCard
          title="Productos"
          value={summary.products}
          detail="Productos creados en todos los tenants"
          icon={<Package size={20} />}
        />
        <StatCard
          title="Categorías"
          value={summary.categories}
          detail="Categorías disponibles para organizar menús"
          icon={<Layers3 size={20} />}
        />
        <StatCard
          title="Destacados"
          value={summary.highlights}
          detail={`${summary.activeHighlights} activos · ${summary.inactiveHighlights} inactivos`}
          icon={<Megaphone size={20} />}
        />
        <StatCard
          title="Mesas"
          value={summary.tables}
          detail="Links públicos y QR configurados"
          icon={<Table2 size={20} />}
        />
      </div>
    </div>
  );
}

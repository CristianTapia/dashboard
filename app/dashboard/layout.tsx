"use client";

import DashboardNavButton from "../ui/DashboardNavButton";
import CollapsibleNavButton from "../ui/CollapsibleNavButton";
import { ChartNoAxesColumn, Percent, UtensilsCrossed, Shapes, Settings } from "lucide-react";

const iconSize = 20;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      {/* Sidebar */}
      <aside className="w-[clamp(14rem,22vw,10rem)] shrink-0 sticky top-0 h-[100dvh] overflow-auto bg-[var(--color-foreground)]">
        <nav>
          <ul className="gap-2 flex flex-col p-4">
            <DashboardNavButton icon={<ChartNoAxesColumn size={iconSize} />} name="Resumen" href="/dashboard" />
            <DashboardNavButton icon={<Percent size={iconSize} />} name="Destacados" href="/dashboard/destacados" />

            <CollapsibleNavButton
              icon={<UtensilsCrossed size={iconSize} />}
              label="Productos"
              baseHref="/dashboard/productos"
              items={[
                { href: "/dashboard/productos/nuevo", label: "Agregar nuevos productos" },
                { href: "/dashboard/productos", label: "Ver todos los productos" },
              ]}
            />
            <DashboardNavButton icon={<Shapes size={iconSize} />} name="Categorías" href="/dashboard/categorias" />
            <DashboardNavButton
              icon={<Settings size={iconSize} />}
              name="Configuración"
              href="/dashboard/configuracion"
            />
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="p-4 overflow-y-auto">{children}</main>
    </div>
  );
}

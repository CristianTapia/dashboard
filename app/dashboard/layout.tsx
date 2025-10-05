"use client";

import DashboardNavButton from "../ui/DashboardNavButton";
import CollapsibleNavButton from "../ui/CollapsibleNavButton";
import { ChartNoAxesColumn, Percent, UtensilsCrossed, Shapes, Settings } from "lucide-react";
import { useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Nav tab icon size
  const iconSize = 20;

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-[clamp(14rem,22vw,10rem)] shrink-0 sticky top-0 h-[100dvh] overflow-auto bg-[var(--color-foreground)] border-r border-[var(--color-line-limit)]">
        {/* Bussiness's name */}
        <div className="flex items-center justify-center h-20 border-b border-[var(--color-line-limit)] p-4">
          <div className="w-12 h-12 border border-gray-300 rounded-xl flex items-center justify-center text-xs">
            Foto
          </div>
          <h1 className="pl-3 font-semibold text-lg">Administración</h1>
        </div>
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
      <main className="w-full p-4 overflow-y-auto bg-[var(--color-background)]">{children}</main>
    </div>
  );
}

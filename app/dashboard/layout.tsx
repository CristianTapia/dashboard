"use client";

import DashboardButton from "../ui/DashboardButton";
import { ChartNoAxesColumn, Percent, UtensilsCrossed, Settings } from "lucide-react";

const size = 20;

function iconProp(size: number) {
  return size;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      {/* Sidebar */}
      <aside
        className="w-[clamp(14rem,22vw,10rem)] shrink-0
                     sticky top-0 h-[100dvh] overflow-auto bg-[var(--color-foreground)]"
      >
        <nav>
          <ul className="gap-2 flex flex-col p-4">
            <DashboardButton icon={<ChartNoAxesColumn size={iconProp(size)} />} name="Resumen" href="/dashboard" />
            <DashboardButton icon={<Percent size={iconProp(size)} />} name="Destacados" href="/dashboard/destacados" />
            <DashboardButton
              icon={<UtensilsCrossed size={iconProp(size)} />}
              name="Productos"
              href="/dashboard/productos"
            />
            <DashboardButton
              icon={<Settings size={iconProp(size)} />}
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

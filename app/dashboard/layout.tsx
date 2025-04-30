"use client";

import DashboardButton from "../ui/DashboardButton";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[250px_1fr] grid-rows-[60px_1fr] h-screen">
      {/* Header */}
      <header className="col-span-2 bg-gray-800 text-white flex items-center px-6">
        <h1 className="text-lg font-semibold">Panel de Administración</h1>
      </header>

      {/* Sidebar */}
      <aside className="bg-blue-900 text-white p-4">
        <nav>
          <ul className="space-y-2">
            <DashboardButton name="Resumen" href="/dashboard" />
            <DashboardButton name="Mesa - Vista bloques" href="/dashboard/mesas-vista-bloques" />
            <DashboardButton name="Mesa - Vista planta" href="/dashboard/mesas-vista-planta" />
            <DashboardButton name="Productos" href="/dashboard/productos" />
            <DashboardButton name="Configuración" href="/dashboard/configuracion" />
          </ul>
        </nav>
      </aside>

      {/* Contenido dinámico */}
      <main className="flex flex-wrap gap-2 items-start content-start p-3">{children}</main>
    </div>
  );
}

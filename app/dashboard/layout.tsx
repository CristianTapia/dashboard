"use client";

import Link from "next/link";

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
            <li>
              <Link href="/dashboard/mesas-vista-bloques" className="block p-2 bg-gray-700 rounded hover:bg-gray-600">
                Mesas - Vista de Bloques
              </Link>
            </li>
            <li>
              <Link href="/dashboard/mesas-vista-planta" className="block p-2 bg-gray-700 rounded hover:bg-gray-600">
                Mesas - Vista de planta
              </Link>
            </li>
            <li>
              <Link href="/dashboard/productos" className="block p-2 bg-gray-700 rounded hover:bg-gray-600">
                Productos
              </Link>
            </li>
            <li>
              <Link href="/dashboard/configuracion" className="block p-2 bg-gray-700 rounded hover:bg-gray-600">
                Configuración
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Contenido dinámico */}
      <main className="flex flex-wrap gap-2 items-start content-start p-3">{children}</main>
    </div>
  );
}

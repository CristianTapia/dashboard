"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSidebar, SidebarProvider } from "../context/SidebarContext";
import { productArray } from "../lib/data";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { showCategories, setShowCategories } = useSidebar();

  useEffect(() => {
    setShowCategories(false); // Oculta las categorías al cambiar de ruta
  }, [pathname, setShowCategories]); // Added setShowCategories to the dependency array

  // Categorías únicas desde productArray
  const uniqueCategories = useMemo(() => {
    return [...new Set(productArray.map((p) => p.category))];
  }, []);

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
            <li>
              {showCategories && (
                <ul className="mt-4 space-y-2">
                  {uniqueCategories.map((category) => (
                    <li key={category} className="text-sm pl-2">
                      {category}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </nav>
      </aside>

      {/* Contenido dinámico */}
      <main className="flex flex-wrap gap-2 items-start content-start p-3">{children}</main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}

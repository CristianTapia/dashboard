import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[250px_1fr] grid-rows-[60px_1fr] h-screen">
      {/* Header */}
      <header className="col-span-2 bg-gray-800 text-white flex items-center px-6">
        <h1 className="text-lg font-semibold">Panel de Administración</h1>
      </header>

      {/* Sidebar */}
      <aside className="bg-gray-900 text-white p-4">
        <nav>
          <ul className="space-y-2">
            <li>
              <Link href="/dashboard" className="block p-2 bg-gray-700 rounded hover:bg-gray-600">
                Vista de Bloques
              </Link>
            </li>
            <li>
              <Link href="/dashboard/users" className="block p-2 bg-gray-700 rounded hover:bg-gray-600">
                Vista de planta
              </Link>
            </li>
            <li>
              <details>
                <summary className="p-2 bg-gray-700 rounded hover:bg-gray-600">Mesas</summary>
                <Link href="/dashboard/products" className="block p-2">
                  Agregar Mesa
                </Link>
                <Link href="/dashboard/products" className="block p-2">
                  Editar Mesa
                </Link>
                <Link href="/dashboard/products" className="block p-2">
                  Borrar Mesa
                </Link>
              </details>
            </li>
            <li>
              <details>
                <summary className="p-2 bg-gray-700 rounded hover:bg-gray-600">Productos</summary>
                <Link href="/dashboard/products" className="block p-2">
                  Agregar Producto
                </Link>
                <Link href="/dashboard/products" className="block p-2">
                  Editar Producto
                </Link>
                <Link href="/dashboard/products" className="block p-2">
                  Borrar Producto
                </Link>
              </details>
            </li>
            <li>
              <Link href="/dashboard/settings" className="block p-2 bg-gray-700 rounded hover:bg-gray-600">
                Configuración
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Contenido dinámico */}
      <main className="p-6 bg-gray-100">{children}</main>
    </div>
  );
}

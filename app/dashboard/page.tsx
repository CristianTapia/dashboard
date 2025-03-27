"use client";

export default function Dashboard({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-[60px] bg-gray-800 text-white flex items-center px-6">
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </header>

      {/* Contenedor principal */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-[250px] bg-gray-900 text-white p-4 flex flex-col gap-4">
          <nav>
            <ul className="space-y-2">
              <li className="p-2 bg-gray-700 rounded">Inicio</li>
              <li className="p-2 bg-gray-700 rounded">Usuarios</li>
              <li className="p-2 bg-gray-700 rounded">Configuración</li>
            </ul>
          </nav>
        </aside>

        {/* Contenido Principal */}
        <main className="flex-1 p-6 bg-gray-100 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { createServer } from "@/app/lib/supabase/server";
import DashboardNavButton from "../ui/DashboardNavButton";
import { ChartNoAxesColumn, BadgeDollarSign, UtensilsCrossed, Shapes, Settings, Users } from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

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
            <DashboardNavButton icon={<ChartNoAxesColumn size={iconSize} />} name="Resumen" href="/dashboard/resumen" />

            <DashboardNavButton
              icon={<BadgeDollarSign size={iconSize} />}
              name="Destacados"
              href="/dashboard/destacados"
            />

            <DashboardNavButton
              icon={<UtensilsCrossed size={iconSize} />}
              name="Productos"
              href="/dashboard/productos"
            />

            <DashboardNavButton icon={<Shapes size={iconSize} />} name="Categorías" href="/dashboard/categorias" />

            <DashboardNavButton
              icon={<Settings size={iconSize} />}
              name="Configuración"
              href="/dashboard/configuracion"
            />
            <DashboardNavButton icon={<Users size={iconSize} />} name="Usuarios" href="/dashboard/usuarios" />
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="w-full p-4 overflow-y-auto bg-[var(--color-background)]">{children}</main>
    </div>
  );
}

// Ejemplo de boton colapsable
{
  /*        <CollapsibleNavButton
              icon={<Percent size={iconSize} />}
              label="Destacados"
              baseHref="/dashboard/destacados"
              items={[
                { href: "/dashboard/destacados/nuevo", label: "Añadir nuevo destacado" },
                { href: "/dashboard/destacados/todos", label: "Ver todos los destacados" },
              ]}
            /> */
}

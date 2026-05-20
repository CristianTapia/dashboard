import DashboardNavButton from "../ui/DashboardNavButton";
import LogoutButton from "../ui/LogoutButton";
import { ChartNoAxesColumn, BadgeDollarSign, UtensilsCrossed, Shapes, Settings, Users, Table2 } from "lucide-react";
import { requireUserRedirect } from "@/app/lib/auth";
import { getTenantAccessContext } from "@/app/lib/tenant";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireUserRedirect("/dashboard");
  const { isAdmin } = await getTenantAccessContext();

  const iconSize = 20;
  const navItems = [
    ...(isAdmin
      ? [{ icon: <ChartNoAxesColumn size={iconSize} />, name: "Resumen", href: "/dashboard/resumen" }]
      : []),
    { icon: <BadgeDollarSign size={iconSize} />, name: "Destacados", href: "/dashboard/destacados" },
    { icon: <UtensilsCrossed size={iconSize} />, name: "Productos", href: "/dashboard/productos" },
    { icon: <Shapes size={iconSize} />, name: "Categorias", href: "/dashboard/categorias" },
    { icon: <Table2 size={iconSize} />, name: "Mesas", href: "/dashboard/mesas" },
    ...(isAdmin
      ? [
          { icon: <Settings size={iconSize} />, name: "Configuracion", href: "/dashboard/configuracion" },
          { icon: <Users size={iconSize} />, name: "Usuarios", href: "/dashboard/usuarios" },
        ]
      : []),
  ];

  return (
    <div className="min-h-[100dvh] bg-[var(--color-background)] md:flex">
      <aside className="hidden md:block w-64 shrink-0 sticky top-0 h-[100dvh] overflow-auto bg-[var(--color-foreground)] border-r border-[var(--color-line-limit)]">
        <div className="flex items-center justify-center h-20 border-b border-[var(--color-line-limit)] p-4">
          <div className="w-12 h-12 border border-gray-300 rounded-xl flex items-center justify-center text-xs">
            Foto
          </div>
          <h1 className="pl-3 font-semibold text-lg">Administracion</h1>
        </div>
        <nav>
          <ul className="gap-2 flex flex-col p-4">
            {navItems.map((item) => (
              <DashboardNavButton key={item.href} icon={item.icon} name={item.name} href={item.href} />
            ))}
          </ul>
        </nav>
        <div className="p-4 pt-0">
          <LogoutButton />
        </div>
      </aside>

      <main className="w-full min-w-0 p-2 pb-24 sm:p-4 md:pb-4 overflow-y-auto bg-[var(--color-background)]">
        {children}
      </main>

      <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-line-limit)] bg-[var(--color-foreground)]/95 backdrop-blur">
        <ul className="flex gap-1 overflow-x-auto px-2 py-2">
          {navItems.map((item) => (
            <DashboardNavButton key={item.href} icon={item.icon} name={item.name} href={item.href} compact />
          ))}
          <li className="shrink-0 min-w-[72px]">
            <LogoutButton compact />
          </li>
        </ul>
      </nav>
    </div>
  );
}

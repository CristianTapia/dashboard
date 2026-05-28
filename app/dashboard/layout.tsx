import DashboardNavButton from "../ui/DashboardNavButton";
import LogoutButton from "../ui/LogoutButton";
import {
  BadgePercent,
  BellRing,
  ChartNoAxesColumn,
  ConciergeBell,
  Palette,
  Settings,
  Shapes,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { requireUserRedirect } from "@/app/lib/auth";
import { getTenantMenuThemeSettings } from "@/app/lib/data/menu-themes";
import { getCurrentUser, getTenantAccessContext } from "@/app/lib/tenant";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireUserRedirect("/dashboard");
  let isAdmin = false;
  let isTenantAdmin = false;
  let tenantThemesEnabled = false;
  let dashboardTitle = "Dashboard";
  let dashboardSubtitle = "Panel de gestion";

  try {
    const [tenantCtx, user] = await Promise.all([getTenantAccessContext(), getCurrentUser()]);
    isAdmin = tenantCtx.isAdmin;
    isTenantAdmin = tenantCtx.isTenantAdmin;

    const activeTenant = tenantCtx.memberships.find(
      (membership) => membership.tenant_id === tenantCtx.activeTenantId,
    )?.tenant;
    const metadata = user.user_metadata ?? {};
    const userName =
      typeof metadata.display_name === "string"
        ? metadata.display_name
        : typeof metadata.name === "string"
          ? metadata.name
          : typeof metadata.login_name === "string"
            ? metadata.login_name
            : (user.email ?? "Usuario");

    dashboardTitle = tenantCtx.isAdmin ? "Dashboard" : (activeTenant?.name ?? "Dashboard");
    dashboardSubtitle = tenantCtx.isAdmin ? "Administracion global" : userName;

    if (!tenantCtx.isAdmin) {
      const themeSettings = await getTenantMenuThemeSettings(tenantCtx.activeTenantId);
      tenantThemesEnabled = themeSettings.menuThemesEnabled;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "El usuario no tiene tenants activos asignados") {
      return <InactiveTenantState />;
    }

    throw error;
  }

  const iconSize = 20;
  const tenantAdminItems = [
    { icon: <ChartNoAxesColumn size={iconSize} />, name: "Resumen", href: "/dashboard/resumen" },
    { icon: <BadgePercent size={iconSize} />, name: "Destacados", href: "/dashboard/destacados" },
    { icon: <UtensilsCrossed size={iconSize} />, name: "Productos", href: "/dashboard/productos" },
    { icon: <Shapes size={iconSize} />, name: "Categorias", href: "/dashboard/categorias" },
    { icon: <ConciergeBell size={iconSize} />, name: "Mesas", href: "/dashboard/mesas" },
    { icon: <Users size={iconSize} />, name: "Equipo", href: "/dashboard/usuarios" },
    { icon: <BellRing size={iconSize} />, name: "Atención", href: "/dashboard/atencion" },

    ...(tenantThemesEnabled ? [{ icon: <Palette size={iconSize} />, name: "Themes", href: "/dashboard/themes" }] : []),
  ];

  const staffItems = [{ icon: <BellRing size={iconSize} />, name: "Atención", href: "/dashboard/atencion" }];

  const navItems = isAdmin
    ? [
        { icon: <ChartNoAxesColumn size={iconSize} />, name: "Resumen", href: "/dashboard/resumen" },
        { icon: <BadgePercent size={iconSize} />, name: "Destacados", href: "/dashboard/destacados" },
        { icon: <UtensilsCrossed size={iconSize} />, name: "Productos", href: "/dashboard/productos" },
        { icon: <Shapes size={iconSize} />, name: "Categorias", href: "/dashboard/categorias" },
        { icon: <ConciergeBell size={iconSize} />, name: "Mesas", href: "/dashboard/mesas" },
        { icon: <Palette size={iconSize} />, name: "Themes", href: "/dashboard/themes" },
        { icon: <Settings size={iconSize} />, name: "Configuracion", href: "/dashboard/configuracion" },
        { icon: <Users size={iconSize} />, name: "Usuarios", href: "/dashboard/usuarios" },
      ]
    : isTenantAdmin
      ? tenantAdminItems
      : staffItems;

  return (
    <div className="min-h-[100dvh] bg-[var(--color-background)] md:flex">
      <aside className="hidden h-[100dvh] w-64 shrink-0 flex-col border-r border-[var(--color-line-limit)] bg-[var(--color-foreground)] md:sticky md:top-0 md:flex">
        <div className="border-b border-[var(--color-line-limit)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-bg-selected)] text-sm font-bold text-[var(--color-txt-selected)]">
              D
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold leading-tight">{dashboardTitle}</h1>
              <p className="truncate text-xs text-[var(--color-txt-secondary)]">{dashboardSubtitle}</p>
            </div>
          </div>
        </div>
        <nav className="min-h-0 flex-1 overflow-auto p-3">
          <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-txt-secondary)]">
            Secciones
          </p>
          <ul className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <DashboardNavButton key={item.href} icon={item.icon} name={item.name} href={item.href} />
            ))}
          </ul>
        </nav>
        <div className="border-t border-[var(--color-line-limit)] p-3">
          <LogoutButton />
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-40 border-b border-[var(--color-line-limit)] bg-[var(--color-foreground)]/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-bg-selected)] text-sm font-bold text-[var(--color-txt-selected)]">
            D
          </div>
          <div className="min-w-0">
            <p className="max-w-[13rem] truncate text-sm font-bold leading-tight">{dashboardTitle}</p>
            <p className="max-w-[13rem] truncate text-xs text-[var(--color-txt-secondary)]">{dashboardSubtitle}</p>
          </div>
        </div>
      </header>

      <main className="w-full min-w-0 overflow-y-auto bg-[var(--color-background)] px-2 pb-24 pt-20 sm:px-4 md:p-4">
        <div className="mx-auto w-full max-w-screen-2xl">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-line-limit)] bg-[var(--color-foreground)]/95 backdrop-blur md:hidden">
        <ul className="flex gap-1 overflow-x-auto px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2">
          {navItems.map((item) => (
            <DashboardNavButton key={item.href} icon={item.icon} name={item.name} href={item.href} compact />
          ))}
          <li className="min-w-[72px] shrink-0">
            <LogoutButton compact />
          </li>
        </ul>
      </nav>
    </div>
  );
}

function InactiveTenantState() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[var(--color-background)] p-4">
      <section className="w-full max-w-md rounded-2xl border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-6 text-center shadow-card">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-bg-selected)] text-lg font-bold text-[var(--color-txt-selected)]">
          D
        </div>
        <h1 className="mt-5 text-xl font-semibold">Acceso temporalmente desactivado</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-txt-secondary)]">
          Tu tenant no se encuentra activo en este momento. Contacta a soporte o al administrador global para
          restablecer el acceso.
        </p>
        <div className="mt-6 flex justify-center">
          <LogoutButton />
        </div>
      </section>
    </main>
  );
}

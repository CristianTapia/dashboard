import { Gift, MoonStar, Palette, Snowflake, Sun } from "lucide-react";
import Link from "next/link";

import { getCurrentTenantMenuThemeSettings } from "@/app/lib/data/menu-themes";
import { menuThemeOptions } from "@/app/lib/menu-themes";
import { getTenantAccessContext } from "@/app/lib/tenant";
import TenantThemeGrid from "@/app/ui/TenantThemeGrid";

const themeIcons = {
  default: <Palette size={20} />,
  summer: <Sun size={20} />,
  winter: <Snowflake size={20} />,
  halloween: <MoonStar size={20} />,
  christmas: <Gift size={20} />,
};

export default async function ThemesPage() {
  const tenantCtx = await getTenantAccessContext();
  const currentTenantSettings = tenantCtx.isAdmin ? null : await getCurrentTenantMenuThemeSettings();

  if (!tenantCtx.isAdmin && !currentTenantSettings?.menuThemesEnabled) {
    return (
      <div className="flex flex-col p-2 sm:p-4">
        <div className="rounded-xl border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-6 shadow-card">
          <h1 className="text-xl font-semibold">Themes no habilitado</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-txt-secondary)]">
            Esta funcion todavia no esta habilitada para tu tenant. Contacta al administrador global para activar los
            themes del menu.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-2 sm:p-4">
      <div className="flex flex-col items-start gap-1.5">
        <h1 className="text-2xl font-semibold sm:text-[1.7rem]">Themes</h1>
        <p className="max-w-2xl text-sm leading-6 text-[var(--color-txt-secondary)]">
          {tenantCtx.isAdmin
            ? "Catalogo de themes disponibles para los menus publicos de cada tenant."
            : "Selecciona el theme activo para el menu publico de tu tenant."}
        </p>
      </div>

      {tenantCtx.isAdmin ? (
        <section className="mt-6 rounded-xl border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-4 shadow-card sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">Como se usan</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--color-txt-secondary)]">
                Habilita esta funcion por tenant desde Usuarios. Luego el tenant regional vera Themes en su navbar para
                elegir el theme activo.
              </p>
            </div>
            <Link
              href="/dashboard/usuarios"
              className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-[var(--color-border-box)] bg-[var(--color-bg-selected)] px-3 text-xs font-semibold text-[var(--color-txt-selected)] transition hover:border-[var(--color-button-send)]"
            >
              Configuracion por tenant
            </Link>
          </div>
        </section>
      ) : currentTenantSettings ? (
        <section className="mt-6 rounded-xl border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-4 shadow-card sm:p-5">
          <h2 className="text-base font-semibold">Theme activo de {currentTenantSettings.name}</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--color-txt-secondary)]">
            Haz click en una card para cambiar el theme del menu publico.
          </p>
        </section>
      ) : null}

      {currentTenantSettings ? (
        <TenantThemeGrid currentTheme={currentTenantSettings.menuTheme} themeIcons={themeIcons} />
      ) : (
        <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 sm:gap-6">
        {menuThemeOptions.map((theme) => (
          <article
            key={theme.value}
            className="rounded-xl border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-4 shadow-sm transition-shadow hover:shadow-card"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-bg-selected)] text-[var(--color-txt-selected)]">
                  {themeIcons[theme.value]}
                </span>
                <div>
                  <h2 className="text-base font-semibold">{theme.label}</h2>
                  <p className="mt-0.5 font-mono text-xs text-[var(--color-txt-secondary)]">{theme.value}</p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-[var(--color-txt-secondary)]">{theme.description}</p>

            <div className="mt-4 flex gap-2">
              {theme.colors.map((color) => (
                <span
                  key={color}
                  className="h-7 w-7 rounded-full border border-[var(--color-border-box)]"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>

            <ul className="mt-4 space-y-2 text-sm text-[var(--color-txt-secondary)]">
              {theme.details.map((detail) => (
                <li key={detail} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-button-send)]" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
        </div>
      )}
    </div>
  );
}

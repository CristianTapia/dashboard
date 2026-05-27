"use client";

import { ReactNode, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateCurrentTenantMenuThemeAction } from "@/app/dashboard/themes/actions";
import { MenuTheme, menuThemeOptions } from "@/app/lib/menu-themes";

export default function TenantThemeGrid({
  currentTheme,
  themeIcons,
}: {
  currentTheme: MenuTheme;
  themeIcons: Record<MenuTheme, ReactNode>;
}) {
  const router = useRouter();
  const [optimisticTheme, setOptimisticTheme] = useState<MenuTheme>(currentTheme);
  const [pendingTheme, setPendingTheme] = useState<MenuTheme | null>(null);
  const [pending, startTransition] = useTransition();

  function selectTheme(theme: MenuTheme) {
    if (theme === optimisticTheme || pending) return;

    const previousTheme = optimisticTheme;
    setOptimisticTheme(theme);
    setPendingTheme(theme);

    startTransition(async () => {
      try {
        const res = await updateCurrentTenantMenuThemeAction(theme);
        if (res?.ok) {
          router.refresh();
        }
      } catch (err: unknown) {
        setOptimisticTheme(previousTheme);
        const message = err instanceof Error ? err.message : "Error actualizando el theme";
        alert(message);
      } finally {
        setPendingTheme(null);
      }
    });
  }

  return (
    <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 sm:gap-6">
      {menuThemeOptions.map((theme) => {
        const active = optimisticTheme === theme.value;
        const saving = pendingTheme === theme.value;

        return (
          <button
            key={theme.value}
            type="button"
            onClick={() => selectTheme(theme.value)}
            disabled={pending && !saving}
            aria-pressed={active}
            className={`group rounded-xl border bg-[var(--color-foreground)] p-4 text-left shadow-sm transition hover:shadow-card disabled:cursor-not-allowed disabled:opacity-70 ${
              active ? "border-[var(--color-button-send)]" : "border-[var(--color-border-box)]"
            }`}
          >
            <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-bg-selected)] text-[var(--color-txt-selected)]">
                  {themeIcons[theme.value]}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold">{theme.label}</h2>
                  <p className="mt-0.5 font-mono text-xs text-[var(--color-txt-secondary)]">{theme.value}</p>
                </div>
              </div>
              {active ? (
                <span className="inline-flex min-h-7 shrink-0 items-center rounded-full bg-[var(--color-bg-selected)] px-2.5 py-1 text-[11px] font-semibold leading-none text-[var(--color-txt-selected)] sm:text-xs">
                  {saving ? "Guardando..." : "Activo"}
                </span>
              ) : null}
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
          </button>
        );
      })}
    </div>
  );
}

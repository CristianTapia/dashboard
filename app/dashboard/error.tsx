"use client";

import LogoutButton from "@/app/ui/LogoutButton";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  if (error.message === "El usuario no tiene tenants activos asignados") {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[var(--color-background)] p-4">
        <section className="w-full max-w-md rounded-2xl border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-6 text-center shadow-card">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-bg-selected)] text-lg font-bold text-[var(--color-txt-selected)]">
            D
          </div>
          <h1 className="mt-5 text-xl font-semibold">Acceso temporalmente desactivado</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--color-txt-secondary)]">
            La acceso no se encuentra activo en este momento. Contacta a soporte o al administrador global para
            restablecer el acceso.
          </p>
          <div className="mt-6 flex justify-center">
            <LogoutButton />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[var(--color-background)] p-4">
      <section className="w-full max-w-md rounded-2xl border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-6 text-center shadow-card">
        <h1 className="text-xl font-semibold">No se pudo cargar el dashboard</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-txt-secondary)]">
          Ocurrio un problema al cargar esta vista. Intenta nuevamente.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-[var(--color-border-box)] bg-[var(--color-bg-selected)] px-4 text-sm font-medium text-[var(--color-txt-selected)] transition hover:border-[var(--color-button-send)]"
        >
          Reintentar
        </button>
      </section>
    </main>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LayoutDashboard } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin() {
    setPending(true);
    setErrorMessage("");

    try {
      const identifier = loginName.trim().toLowerCase();
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginName: identifier, password }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Credenciales inválidas");
      }
      router.push("/dashboard");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Credenciales inválidas");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--color-background)] text-[var(--foreground)]">
      <div className="flex min-h-[100dvh] flex-col">
        <header className="shrink-0 border-b border-[var(--color-line-limit)] bg-[var(--color-foreground)]/90 px-4 py-4 backdrop-blur sm:px-6">
          <div className="mx-auto flex w-full max-w-5xl items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-bg-selected)] text-[var(--color-button-send)]">
              <LayoutDashboard size={21} />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold sm:text-lg">Dashboard</h2>
              <p className="truncate text-xs text-[var(--color-txt-secondary)]">Panel de administración</p>
            </div>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
          <section className="w-full max-w-[440px] rounded-2xl border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-5 shadow-card sm:p-8">
            <div className="mb-6 text-left">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-box)] bg-[var(--color-bg-selected)] px-3 py-1.5 text-xs font-semibold text-[var(--color-txt-selected)]">
                Acceso privado
              </div>
              <h1 className="text-2xl font-semibold sm:text-3xl">Iniciar sesión</h1>
              <p className="mt-2 text-sm leading-6 text-[var(--color-txt-secondary)]">
                Ingresa tus credenciales para gestionar el contenido del menú.
              </p>
            </div>

            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                handleLogin();
              }}
            >
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Usuario</label>
                <input
                  className="h-12 w-full rounded-xl border border-[var(--color-border-box)] bg-[var(--color-background)] px-3 text-base outline-none transition focus:border-[var(--color-button-send)] focus:bg-[var(--color-foreground)] disabled:opacity-60"
                  placeholder="nombre-de-acceso"
                  required
                  autoComplete="username"
                  type="text"
                  value={loginName}
                  disabled={pending}
                  onChange={(event) => setLoginName(event.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Contraseña</label>
                <div className="flex w-full rounded-xl border border-[var(--color-border-box)] bg-[var(--color-background)] transition focus-within:border-[var(--color-button-send)] focus-within:bg-[var(--color-foreground)]">
                  <input
                    className="h-12 min-w-0 flex-1 rounded-l-xl border-0 bg-transparent px-3 text-base outline-none disabled:opacity-60"
                    placeholder="********"
                    required
                    autoComplete="current-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    disabled={pending}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-r-xl bg-transparent text-[var(--color-light)] transition hover:bg-[var(--color-cancel)] hover:text-[var(--color-light-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                    type="button"
                    disabled={pending}
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOff color="#62748E" /> : <Eye color="#62748E" />}
                  </button>
                </div>
              </div>

              {errorMessage ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                  {errorMessage}
                </p>
              ) : null}

              <button
                className="flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-[var(--color-button-send)] px-4 font-semibold text-white shadow-sm transition hover:bg-[var(--color-button-send-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={pending}
              >
                <span className="truncate">{pending ? "Ingresando..." : "Acceder al dashboard"}</span>
              </button>
            </form>

            <div className="mt-6 border-t border-[var(--color-line-limit)] pt-5 text-center">
              <p className="text-sm text-[var(--color-txt-secondary)]">¿Necesitas una cuenta? Contacta a soporte.</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

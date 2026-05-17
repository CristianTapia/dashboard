"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleLogin() {
    setPending(true);

    try {
      const identifier = loginName.trim().toLowerCase();
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginName: identifier, password }),
      });

      if (!response.ok) throw new Error("Credenciales invalidas");
      router.push("/dashboard");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Credenciales invalidas");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--color-background)] text-[var(--foreground)]">
      <div className="flex min-h-[100dvh] flex-col">
        <header className="shrink-0 border-b border-[var(--color-line-limit)] bg-[var(--color-foreground)] px-4 py-3 sm:px-6">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 text-slate-900 dark:text-white">
              <Box size={28} color="#137fec" className="shrink-0" />
              <h2 className="truncate text-base font-bold sm:text-lg">Panel de Administracion</h2>
            </div>
            <a
              className="shrink-0 rounded-lg border border-[var(--color-border-box)] px-3 py-2 text-sm font-semibold text-[var(--color-button-send)]"
              href="#"
            >
              Ayuda
            </a>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
          <section className="w-full max-w-[440px] rounded-2xl border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-5 shadow-sm sm:p-8">
            <div className="mb-6 text-left sm:mb-8 sm:text-center">
              <h1 className="text-2xl font-bold sm:text-3xl">Iniciar sesion</h1>
              <p className="mt-2 text-sm leading-6 text-[var(--color-txt-secondary)]">
                Ingresa tus credenciales para gestionar el contenido del menu.
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
                  className="h-12 w-full rounded-lg border border-[var(--color-border-box)] bg-[var(--color-foreground)] px-3 text-base outline-none transition focus:border-[var(--color-button-send)] disabled:opacity-60"
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
                <label className="text-sm font-semibold">Contrasena</label>
                <div className="flex w-full">
                  <input
                    className="h-12 min-w-0 flex-1 rounded-l-lg border border-r-0 border-[var(--color-border-box)] bg-[var(--color-foreground)] px-3 text-base outline-none transition focus:border-[var(--color-button-send)] disabled:opacity-60"
                    placeholder="********"
                    required
                    autoComplete="current-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    disabled={pending}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                    className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-r-lg border border-l-0 border-[var(--color-border-box)] bg-[var(--color-foreground)] disabled:cursor-not-allowed disabled:opacity-60"
                    type="button"
                    disabled={pending}
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOff color="#62748E" /> : <Eye color="#62748E" />}
                  </button>
                </div>
              </div>

              <button
                className="flex h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-[var(--color-button-send)] px-4 font-bold text-white transition hover:bg-[var(--color-button-send-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={pending}
              >
                <span className="truncate">{pending ? "Ingresando..." : "Acceder al dashboard"}</span>
              </button>
            </form>

            <div className="mt-6 border-t border-[var(--color-line-limit)] pt-5 text-center">
              <p className="text-sm text-[var(--color-txt-secondary)]">
                Necesitas una cuenta?{" "}
                <a className="font-semibold text-[var(--color-button-send)] hover:underline" href="#">
                  Contacta a soporte
                </a>
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/app/lib/supabase/client";
import { Box, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) alert(error.message);
    else router.push("/dashboard");
  }

  async function handleRegister() {
    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
    });

    if (error) alert(error.message);
    else alert("Registro OK (revisa email si esta activo)");
  }

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display transition-colors duration-300">
      <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          {/* Header */}
          <header className="flex items-center justify-between whitespace-nowrap border-b border-[var(--color-line-limit)] dark:border-slate-800 px-6 md:px-10 py-3 bg-[var(--color-foreground)] dark:bg-slate-900">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <Box size={30} color="#137fec" />
              <h2 className="dark:text-white text-lg font-bold">Panel de Administración</h2>
            </div>
            <div className="flex flex-1 justify-end gap-4">
              <button className="flex cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-[var(--color-button-send)] text-white text-sm font-bold hover:bg-[var(--color-button-send-hover)] transition-colors">
                <span>Ayuda</span>
              </button>
            </div>
          </header>
          {/* Main Content Area */}
          <main className="flex-1 flex items-center justify-center p-4 bg-[var(--color-background)]">
            <div className="w-full max-w-[480px] bg-[var(--color-foreground)] dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-[var(--color-border-box)] dark:border-slate-800">
              {/* Headline */}
              <div className="text-center mb-8">
                <h1 className="dark:text-white text-3xl font-bold pb-2">Iniciar Sesión</h1>
                <p className="text-[var(--color-txt-secondary)] dark:text-slate-400">
                  Ingresa tus credenciales para gestionar el contenido del menú
                </p>
              </div>
              {/* Form */}
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleLogin();
                }}
              >
                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label className="dark:text-slate-200 font-semibold text-sm">Correo Electrónico</label>
                  <input
                    className="form-input text-sm bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 mb-4"
                    placeholder="ejemplo@correo.com"
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
                {/* Password */}
                <div className="flex flex-col gap-2">
                  <label className="dark:text-slate-200 font-semibold text-sm">Contraseña</label>

                  <div className="flex w-full rounded-lg">
                    <input
                      className="flex-1 form-input text-sm bg-[var(--color-foreground)] rounded-l-lg border border-r-0 border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 mb-4"
                      placeholder="••••••••"
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                    <button
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      className="cursor-pointer text-sm bg-[var(--color-foreground)] rounded-r-lg border border-l-0 border-[var(--color-border-box)] p-3 mb-4"
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <EyeOff color="#62748E" /> : <Eye color="#62748E" />}
                    </button>
                  </div>
                </div>
                {/* Options */}
                <div className="flex items-center justify-between py-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      className="cursor-pointer rounded border-[var(--color-border-box)] dark:border-slate-700 text-primary focus:ring-primarydark:bg-slate-800 transition-all"
                      type="checkbox"
                    />
                    <span className="text-sm text-[var(--color-txt-secondary)] dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                      Recordarme
                    </span>
                  </label>
                  <a
                    className="text-sm text-[var(--color-button-send)] font-semibold text-primary hover:underline"
                    href="#"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                {/* Botón */}
                <button
                  className="w-full bg-[var(--color-button-send)] flex cursor-pointer items-center justify-center rounded-lg h-14 text-white font-bold hover:bg-primary/90 shadow-md shadow-primary/20 active:scale-[0.98] transition-all"
                  type="submit"
                >
                  <span className="truncate">Acceder al Dashboard</span>
                </button>
              </form>
              {/* Footer */}
              <div className="mt-8 text-center pt-6 border-t border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  ¿Necesitas una cuenta?{" "}
                  <a className="text-[var(--color-button-send)] font-semibold hover:underline" href="#">
                    Contacta a soporte
                  </a>
                </p>
              </div>
            </div>
          </main>
          {/* <!-- Bottom Background Decoration (Abstract) --> */}
          <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/10 via-primary to-primary/10"></div>
        </div>
      </div>
    </div>
  );
}

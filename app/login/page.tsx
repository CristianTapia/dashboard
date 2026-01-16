"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/app/lib/supabase/client";
import { Box } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    <body className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display transition-colors duration-300">
      <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          {/* Header */}
          <header className="flex items-center justify-between whitespace-nowrap border-b border-[var(--color-line-limit)] dark:border-slate-800 px-6 md:px-10 py-3 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <Box size={30} color="#137fec" />
              <h2 className="dark:text-white text-lg font-bold">Panel de Administración</h2>
            </div>
            <div className="flex flex-1 justify-end gap-4">
              <button className="flex cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-[var(--color-button-send)] text-white text-sm font-bold hover:bg-[var(--color-button-send-hover)] transition-colors">
                <span className="">Ayuda</span>
              </button>
            </div>
          </header>
          {/* <!-- Main Content Area --> */}
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-[480px] bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
              {/* <!-- Headline Section --> */}
              <div className="text-center mb-8">
                <h1 className="text-slate-900 dark:text-white tracking-tight text-[32px] font-bold leading-tight pb-2">
                  Iniciar Sesión
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
                  Ingresa tus credenciales para gestionar el contenido destacado
                </p>
              </div>
              {/* <!-- Login Form --> */}
              <form className="space-y-6">
                {/* <!-- Email Field --> */}
                <div className="flex flex-col gap-2">
                  <label className="text-slate-900 dark:text-slate-200 text-base font-medium leading-normal">
                    Correo Electrónico
                  </label>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary h-14 placeholder:text-slate-400 p-[15px] text-base font-normal"
                    placeholder="ejemplo@correo.com"
                    // required=""
                    type="email"
                  />
                </div>
                {/* <!-- Password Field --> */}
                <div className="flex flex-col gap-2">
                  <label className="text-slate-900 dark:text-slate-200 text-base font-medium leading-normal">
                    Contraseña
                  </label>
                  <div className="flex w-full items-stretch rounded-lg">
                    <input
                      className="form-input flex w-full min-w-0 flex-1 rounded-lg rounded-r-none text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary h-14 placeholder:text-slate-400 p-[15px] border-r-0 pr-2 text-base font-normal"
                      placeholder="••••••••"
                      // required=""
                      type="password"
                    />
                    <div className="text-slate-400 flex border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 items-center justify-center pr-[15px] rounded-r-lg border-l-0 cursor-pointer hover:text-primary">
                      <span className="material-symbols-outlined">visibility</span>
                    </div>
                  </div>
                </div>
                {/* <!-- Options Row --> */}
                <div className="flex items-center justify-between py-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      className="rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary bg-white dark:bg-slate-800 transition-all"
                      type="checkbox"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                      Recordarme
                    </span>
                  </label>
                  <a className="text-sm font-medium text-primary hover:underline" href="#">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                {/* <!-- Action Button --> */}
                <button
                  className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 shadow-md shadow-primary/20 active:scale-[0.98] transition-all"
                  type="submit"
                >
                  <span className="truncate">Acceder al Dashboard</span>
                </button>
              </form>
              {/* <!-- Footer Text --> */}
              <div className="mt-8 text-center pt-6 border-t border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  ¿Necesitas una cuenta?{" "}
                  <a className="text-primary font-semibold hover:underline" href="#">
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
      <div style={{ maxWidth: 360, margin: "80px auto", padding: 24 }}>
        <h1 style={{ marginBottom: 16 }}>Iniciar sesion</h1>
        <label style={{ display: "block", marginBottom: 8 }}>
          Email
          <input
            style={{ display: "block", width: "100%", marginTop: 4, padding: 8 }}
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label style={{ display: "block", marginBottom: 16 }}>
          Password
          <input
            style={{ display: "block", width: "100%", marginTop: 4, padding: 8 }}
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleRegister}>Register</button>
        </div>
      </div>
    </body>
  );
}

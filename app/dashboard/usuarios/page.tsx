"use client";

import { useState } from "react";

export default function UsuariosPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Usuarios</h1>
          <p className="text-sm text-[var(--color-txt-secondary)]">
            Crear usuarios para el tenant activo (UI solamente por ahora).
          </p>
        </div>
      </div>

      <section className="bg-[var(--color-foreground)] border border-[var(--color-line-limit)] rounded-xl p-6 max-w-[720px]">
        <h2 className="text-lg font-semibold mb-4">Nuevo usuario</h2>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            alert("UI solamente: aun no crea usuarios.");
          }}
        >
          <label className="grid gap-2">
            <span className="text-sm font-medium">Correo</span>
            <input
              className="form-input text-sm rounded-lg border border-[var(--color-border-box)] p-3 bg-transparent"
              placeholder="usuario@empresa.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">Contrasena</span>
            <input
              className="form-input text-sm rounded-lg border border-[var(--color-border-box)] p-3 bg-transparent"
              placeholder="Minimo 8 caracteres"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">Rol</span>
            <select
              className="form-select text-sm rounded-lg border border-[var(--color-border-box)] p-3 bg-transparent"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              className="bg-[var(--color-button-send)] text-white rounded-lg h-10 px-4 font-semibold"
              type="submit"
            >
              Crear usuario
            </button>
            <button
              className="border border-[var(--color-line-limit)] rounded-lg h-10 px-4"
              type="reset"
              onClick={() => {
                setEmail("");
                setPassword("");
                setRole("member");
              }}
            >
              Limpiar
            </button>
          </div>
        </form>
      </section>

      <section className="bg-[var(--color-foreground)] border border-[var(--color-line-limit)] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2">Usuarios del tenant</h2>
        <p className="text-sm text-[var(--color-txt-secondary)]">Aun no hay listado conectado.</p>
      </section>
    </div>
  );
}

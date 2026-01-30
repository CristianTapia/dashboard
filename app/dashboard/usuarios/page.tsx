"use client";

import { useState } from "react";
import { CirclePlus, Search } from "lucide-react";

export default function UsuariosPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");

  return (
    <div className="max-w-auto p-4 flex flex-col">
      <div className="flex flex-col items-start gap-2">
        <h1 className="text-3xl font-bold">Usuarios</h1>
        <p className="text-md text-[var(--color-txt-secondary)]">Visualiza los usuarios existentes.</p>
      </div>

      {/* Añadir y buscar */}
      <div className="mt-4">
        {/* Botón añadir */}
        <button
          type="button"
          // onClick={() => openModal("addProduct")}
          className="p-2 pl-5 pr-5 bg-[var(--color-button-send)] text-white rounded-xl cursor-pointer font-bold disabled:opacity-60 inline-flex items-center justify-center gap-2 transition"
        >
          <CirclePlus /> Añadir nuevo usuario
        </button>
      </div>
      {/* Búsqueda */}
      <div className="flex w-full flex-1 items-stretch rounded-lg h-full mt-6 mb-6">
        <div className="text-slate-500 dark:text-slate-400 flex bg-[var(--color-foreground)] dark:bg-background-dark items-center justify-center p-2 rounded-l-lg border border-[var(--color-border-box)] border-r-0">
          <Search />
        </div>
        <input
          type="text"
          name="search"
          className="w-full bg-[var(--color-foreground)] rounded-r-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3"
          placeholder="Buscar usuarios por nombre"
          // value={search.term}
          // onChange={(e) => setSearch((prev) => ({ ...prev, term: e.target.value }))}
        />
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

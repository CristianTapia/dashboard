"use client";

import { useState, useTransition, type FormEvent } from "react";
import { createUserAction } from "@/app/dashboard/usuarios/actions";

export default function AddUsers({ onCancel, onSuccess }: { onCancel?: () => void; onSuccess?: () => void }) {
  const [tenantName, setTenantName] = useState("");
  const [tenantDomain, setTenantDomain] = useState("");
  const [tenantAddress, setTenantAddress] = useState("");
  const [tenantMapsUrl, setTenantMapsUrl] = useState("");
  const [loginName, setLoginName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!tenantName.trim()) return alert("El nombre del local es obligatorio");
    if (!loginName.trim()) return alert("El nombre de acceso es obligatorio");

    startTransition(async () => {
      try {
        const res = await createUserAction({
          tenantName: tenantName.trim(),
          tenantDomain: tenantDomain.trim() || undefined,
          tenantAddress: tenantAddress.trim() || undefined,
          tenantMapsUrl: tenantMapsUrl.trim() || undefined,
          loginName: loginName.trim().toLowerCase(),
          email: email.trim(),
          password,
          role,
        });
        if (res?.ok) {
          alert("Usuario creado con exito");
          setTenantName("");
          setTenantDomain("");
          setTenantAddress("");
          setTenantMapsUrl("");
          setLoginName("");
          setEmail("");
          setPassword("");
          setRole("member");
          onSuccess?.();
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error agregando al usuario";
        alert(message);
        console.error(err);
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl flex flex-col">
      <form onSubmit={onSubmit} className="flex flex-col gap-6 mt-6">
        <div className="flex flex-col">
          <label className="text-sm pb-2 font-semibold">Nombre del local *</label>
          <input
            type="text"
            name="tenantName"
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
            placeholder="Ej: Restaurant A"
            disabled={pending}
            className="bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 placeholder:text-sm text-sm"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm pb-2 font-semibold">Clave publica del tenant</label>
          <input
            type="text"
            name="tenantDomain"
            value={tenantDomain}
            onChange={(e) => setTenantDomain(e.target.value.toLowerCase())}
            placeholder="Ej: local-12"
            disabled={pending}
            className="bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 placeholder:text-sm text-sm"
          />
          <p className="text-xs text-[var(--color-txt-secondary)] mt-2">
            Si lo dejas vacio, se genera automaticamente a partir del nombre.
          </p>
        </div>

        <div className="flex flex-col">
          <label className="text-sm pb-2 font-semibold">Direccion del local</label>
          <input
            type="text"
            name="tenantAddress"
            value={tenantAddress}
            onChange={(e) => setTenantAddress(e.target.value)}
            placeholder="Ej: Av. Siempre Viva 123, Santiago"
            disabled={pending}
            className="bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 placeholder:text-sm text-sm"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm pb-2 font-semibold">Link de Google Maps</label>
          <input
            type="url"
            name="tenantMapsUrl"
            value={tenantMapsUrl}
            onChange={(e) => setTenantMapsUrl(e.target.value)}
            placeholder="https://maps.app.goo.gl/..."
            disabled={pending}
            className="bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 placeholder:text-sm text-sm"
          />
          <p className="text-xs text-[var(--color-txt-secondary)] mt-2">
            Este link se comparte desde el boton Ubicacion de la carta publica.
          </p>
        </div>

        <div className="flex flex-col">
          <label className="text-sm pb-2 font-semibold">Nombre de acceso *</label>
          <input
            type="text"
            name="loginName"
            value={loginName}
            onChange={(e) => setLoginName(e.target.value.toLowerCase())}
            placeholder="Ej: local12"
            disabled={pending}
            className="bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 placeholder:text-sm text-sm"
            required
          />
          <p className="text-xs text-[var(--color-txt-secondary)] mt-2">
            Este nombre reemplaza al correo para iniciar sesion.
          </p>
        </div>

        <div className="flex flex-col">
          <label className="text-sm pb-2 font-semibold">Correo electronico *</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@restaurant.com"
            disabled={pending}
            className="bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 placeholder:text-sm text-sm"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm pb-2 font-semibold">Contrasena *</label>
          <input
            className="bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 placeholder:text-sm text-sm"
            placeholder="********"
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm pb-2 font-semibold">Rol *</label>
          <select
            className="form-select text-sm cursor-pointer bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3"
            value={role}
            onChange={(event) => setRole(event.target.value as "admin" | "member")}
          >
            <option value="admin">Admin</option>
            <option value="member">Usuario</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 px-0 sm:px-4 text-sm font-bold justify-center">
          <button
            type="button"
            onClick={onCancel}
            className="flex justify-center px-4 p-3 gap-2 rounded-xl cursor-pointer bg-[var(--color-cancel)] text-black hover:bg-[var(--color-cancel-hover)]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending}
            className="flex justify-center px-4 p-3 gap-2 rounded-xl cursor-pointer bg-[var(--color-button-send)] text-white disabled:opacity-60 items-center transition font-bold hover:bg-[var(--color-button-send-hover)]"
          >
            {pending ? "Anadiendo..." : "Anadir"}
          </button>
        </div>
      </form>
    </div>
  );
}

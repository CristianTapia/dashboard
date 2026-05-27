"use client";

import { useState, useTransition, type FormEvent } from "react";
import { updateUserAction } from "@/app/dashboard/usuarios/actions";

export default function EditUsers({
  userId,
  tenantId,
  tenantName,
  tenantDomain,
  tenantAddress,
  tenantMapsUrl,
  loginName,
  role,
  onCancel,
  onSuccess,
}: {
  userId: string;
  tenantId: string;
  tenantName: string;
  tenantDomain?: string | null;
  tenantAddress?: string | null;
  tenantMapsUrl?: string | null;
  loginName?: string | null;
  role?: string | null;
  onCancel?: () => void;
  onSuccess?: () => void;
}) {
  const [name, setName] = useState(tenantName);
  const [domain, setDomain] = useState(tenantDomain ?? "");
  const [address, setAddress] = useState(tenantAddress ?? "");
  const [mapsUrl, setMapsUrl] = useState(tenantMapsUrl ?? "");
  const [accessName, setAccessName] = useState(loginName ?? "");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "member">(role === "admin" ? "admin" : "member");
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) return alert("El nombre del local es obligatorio");
    if (!domain.trim()) return alert("La clave publica es obligatoria");
    if (!accessName.trim()) return alert("El nombre de acceso es obligatorio");

    startTransition(async () => {
      try {
        const res = await updateUserAction(tenantId, {
          userId,
          tenantName: name.trim(),
          tenantDomain: domain.trim(),
          tenantAddress: address.trim() || undefined,
          tenantMapsUrl: mapsUrl.trim() || undefined,
          loginName: accessName.trim().toLowerCase(),
          password: password.trim() || undefined,
          role: selectedRole,
        });
        if (res?.ok) {
          alert("Tenant actualizado con exito");
          onSuccess?.();
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error actualizando el tenant";
        alert(message);
        console.error(err);
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl flex flex-col">
      <form onSubmit={onSubmit} className="flex flex-col gap-6 mt-6">
        <div className="flex flex-col">
          <label className="text-sm pb-2 font-semibold">Nombre actual</label>
          <div className="flex w-full items-center rounded-lg border border-gray-300 bg-[var(--color-cancel)] p-3 mb-4">
            <p className="text-sm font-normal leading-normal text-gray-500">{tenantName}</p>
          </div>

          <label className="text-sm pb-2 font-semibold">Nuevo nombre del local *</label>
          <input
            type="text"
            name="tenantName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Restaurant A"
            disabled={pending}
            className="bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 placeholder:text-sm text-sm"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm pb-2 font-semibold">Clave publica *</label>
          <input
            type="text"
            name="tenantDomain"
            value={domain}
            onChange={(e) => setDomain(e.target.value.toLowerCase())}
            placeholder="Ej: local-12"
            disabled={pending}
            className="bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 placeholder:text-sm text-sm"
            required
          />
          <p className="text-xs text-[var(--color-txt-secondary)] mt-2">Esta clave es la que usa la URL publica.</p>
        </div>

        <div className="flex flex-col">
          <label className="text-sm pb-2 font-semibold">Direccion del local</label>
          <input
            type="text"
            name="tenantAddress"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
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
            value={mapsUrl}
            onChange={(e) => setMapsUrl(e.target.value)}
            placeholder="https://maps.app.goo.gl/..."
            disabled={pending}
            className="bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 placeholder:text-sm text-sm"
          />
          <p className="text-xs text-[var(--color-txt-secondary)] mt-2">
            Este link se comparte desde el boton Ubicacion de la carta publica.
          </p>
        </div>

        <div className="hidden rounded-xl border border-[var(--color-border-box)] bg-[var(--color-background)] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Temas personalizables del menú</p>
              <p className="mt-1 text-xs leading-5 text-[var(--color-txt-secondary)]">
                Permite que este tenant use themes estacionales como verano, invierno, Halloween o Navidad.
              </p>
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={() => undefined}
              className="dashboard-status-toggle shrink-0 is-off"
              aria-pressed={false}
            >
              <span className="truncate">Deshabilitado</span>
              <span className="dashboard-status-track" aria-hidden="true">
                <span className="dashboard-status-thumb" />
              </span>
            </button>
          </div>

          <div className="mt-4 flex flex-col">
            <label className="pb-2 text-sm font-semibold">Tema activo</label>
            <select
              className="form-select cursor-pointer rounded-lg border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-3 text-sm focus:border-[var(--color-button-send)] focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60"
              value="default"
              onChange={() => undefined}
              disabled
            >
              <option value="default">Predeterminado</option>
            </select>
            <p className="mt-2 text-xs text-[var(--color-txt-secondary)]">
              La app menú puede leer esta configuración desde la API pública del tenant.
            </p>
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-sm pb-2 font-semibold">Nombre de acceso *</label>
          <input
            type="text"
            name="loginName"
            value={accessName}
            onChange={(e) => setAccessName(e.target.value.toLowerCase())}
            placeholder="Ej: local-12"
            disabled={pending}
            className="bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 placeholder:text-sm text-sm"
            required
          />
          <p className="text-xs text-[var(--color-txt-secondary)] mt-2">
            Este nombre es el que usa el cliente para iniciar sesion.
          </p>
        </div>

        <div className="flex flex-col">
          <label className="text-sm pb-2 font-semibold">Nueva contrasena</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Dejar vacio para no cambiar"
            disabled={pending}
            className="bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 placeholder:text-sm text-sm"
          />
          <p className="text-xs text-[var(--color-txt-secondary)] mt-2">
            Solo usuarios admin pueden cambiar contrasenas y roles.
          </p>
        </div>

        <div className="flex flex-col">
          <label className="text-sm pb-2 font-semibold">Rol *</label>
          <select
            className="form-select text-sm cursor-pointer bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3"
            value={selectedRole}
            onChange={(event) => setSelectedRole(event.target.value as "admin" | "member")}
            disabled={pending}
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
            {pending ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}

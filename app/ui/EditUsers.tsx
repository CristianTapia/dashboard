"use client";

import { useState, useTransition, type FormEvent } from "react";
import { updateUserAction } from "@/app/dashboard/usuarios/actions";

export default function EditUsers({
  userId,
  tenantId,
  tenantName,
  tenantDomain,
  role,
  onCancel,
  onSuccess,
}: {
  userId: string;
  tenantId: string;
  tenantName: string;
  tenantDomain?: string | null;
  role?: string | null;
  onCancel?: () => void;
  onSuccess?: () => void;
}) {
  const [name, setName] = useState(tenantName);
  const [domain, setDomain] = useState(tenantDomain ?? "");
  const [selectedRole, setSelectedRole] = useState<"admin" | "member">(role === "admin" ? "admin" : "member");
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) return alert("El nombre del local es obligatorio");
    if (!domain.trim()) return alert("La clave publica es obligatoria");

    startTransition(async () => {
      try {
        const res = await updateUserAction(tenantId, {
          userId,
          tenantName: name.trim(),
          tenantDomain: domain.trim(),
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

        <div className="flex gap-4 px-4 text-sm font-bold justify-center">
          <button
            type="button"
            onClick={onCancel}
            className="flex px-4 p-3 gap-2 rounded-xl cursor-pointer bg-[var(--color-cancel)] text-black hover:bg-[var(--color-cancel-hover)]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending}
            className="flex px-4 p-3 gap-2 rounded-xl cursor-pointer bg-[var(--color-button-send)] text-white disabled:opacity-60 items-center justify-center transition font-bold hover:bg-[var(--color-button-send-hover)]"
          >
            {pending ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}

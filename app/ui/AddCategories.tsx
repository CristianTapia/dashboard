"use client";

import { useState, useTransition } from "react";
import { createCategoryAction } from "@/app/dashboard/categorias/actions";
import { TenantOption } from "@/app/lib/validators/types";

export default function AddCategories({
  onCancel,
  onSuccess,
  tenants,
  isAdmin,
  activeTenantId,
}: {
  onCancel?: () => void;
  onSuccess?: () => void;
  tenants: TenantOption[];
  isAdmin: boolean;
  activeTenantId: string;
}) {
  const [name, setName] = useState("");
  const [tenantId, setTenantId] = useState(activeTenantId);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) return alert("El nombre es obligatorio");
    if (isAdmin && !tenantId) return alert("Selecciona un tenant");

    startTransition(async () => {
      try {
        const res = await createCategoryAction({
          name: name.trim(),
          tenant_id: isAdmin ? tenantId : undefined,
        });
        if (res?.ok) {
          alert("Categoria creada");
          setName("");
          setTenantId(activeTenantId);
          onSuccess?.();
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error agregando la categoria";
        alert(message);
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl flex flex-col">
      <form onSubmit={onSubmit} className="flex flex-col gap-6 mt-6">
        {isAdmin && (
          <div className="flex flex-col">
            <label className="text-sm pb-2 font-semibold">Tenant *</label>
            <select
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              disabled={pending}
              className="cursor-pointer w-full bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)]
                         focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3"
              required
            >
              <option value="" disabled>
                Selecciona un tenant
              </option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col">
          <label className="text-sm pb-2 font-semibold">Nombre *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Pizzas"
            disabled={pending}
            className="bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)]
                       focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 placeholder:text-sm text-sm"
            required
          />
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
            className="flex px-4 p-3 gap-2 rounded-xl cursor-pointer bg-[var(--color-button-send)] text-white
                       disabled:opacity-60 items-center justify-center transition font-bold hover:bg-[var(--color-button-send-hover)]"
          >
            {pending ? "Anadiendo..." : "Anadir"}
          </button>
        </div>
      </form>
    </div>
  );
}

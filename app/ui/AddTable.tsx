"use client";

import { useState, useTransition } from "react";

import { createRestaurantTableAction } from "@/app/dashboard/mesas/actions";
import { TenantOption } from "@/app/lib/validators/types";

export default function AddTable({
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
  const [number, setNumber] = useState("");
  const [tenantId, setTenantId] = useState(activeTenantId);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim() && !number.trim()) {
      alert("Ingresa un nombre o número de mesa");
      return;
    }

    if (number.trim() && !/^\d+$/.test(number.trim())) {
      alert("El número de mesa sólo puede contener números");
      return;
    }

    if (isAdmin && !tenantId) {
      alert("Selecciona un tenant");
      return;
    }

    startTransition(async () => {
      try {
        const res = await createRestaurantTableAction({
          name: name.trim() || undefined,
          number: number.trim() || undefined,
          tenant_id: isAdmin ? tenantId : undefined,
          active: true,
        });

        if (res?.ok) {
          alert("Mesa creada");
          setName("");
          setNumber("");
          setTenantId(activeTenantId);
          onSuccess?.();
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error creando la mesa";
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
              className="cursor-pointer w-full bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm pb-2 font-semibold">Número de mesa</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={number}
              onChange={(e) => setNumber(e.target.value.replace(/\D/g, ""))}
              placeholder="Ej: 12"
              disabled={pending}
              className="bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 placeholder:text-sm text-sm"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm pb-2 font-semibold">Nombre de mesa</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Terraza norte"
              disabled={pending}
              className="bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 placeholder:text-sm text-sm"
            />
          </div>
        </div>

        <p className="text-sm text-[var(--color-txt-secondary)]">
          El sistema generará automáticamente un identificador público único para la mesa. Ese valor será la parte
          técnica del link y del QR.
        </p>

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
            {pending ? "Creando..." : "Crear mesa"}
          </button>
        </div>
      </form>
    </div>
  );
}

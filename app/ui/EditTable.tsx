"use client";

import { useEffect, useState, useTransition } from "react";

import { updateRestaurantTableAction } from "@/app/dashboard/mesas/actions";
import { RestaurantTable } from "@/app/lib/validators/types";

export default function EditTable({
  table,
  onCancel,
  onSuccess,
}: {
  table: RestaurantTable;
  onCancel?: () => void;
  onSuccess?: () => void;
}) {
  const [name, setName] = useState(table.name ?? "");
  const [number, setNumber] = useState(table.number ?? "");
  const [salon, setSalon] = useState(table.salon ?? "Salon 1");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setName(table.name ?? "");
    setNumber(table.number ?? "");
    setSalon(table.salon ?? "Salon 1");
  }, [table]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim() && !number.trim() && !salon.trim()) {
      alert("Ingresa un nombre o número de mesa");
      return;
    }

    if (number.trim() && !/^\d+$/.test(number.trim())) {
      alert("El número de mesa sólo puede contener números");
      return;
    }

    startTransition(async () => {
      try {
        const res = await updateRestaurantTableAction(table.id, {
          name: name.trim() || undefined,
          number: number.trim() || undefined,
          salon: salon.trim() || undefined,
        });

        if (res?.ok) {
          alert("Mesa actualizada");
          onSuccess?.();
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error actualizando la mesa";
        alert(message);
      }
    });
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex flex-col">
            <label className="pb-2 text-sm font-semibold">Salon</label>
            <input
              type="text"
              value={salon}
              onChange={(e) => setSalon(e.target.value)}
              placeholder="Ej: Salon 1"
              disabled={pending}
              className="rounded-lg border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-3 text-sm placeholder:text-sm focus:border-[var(--color-button-send)] focus:outline-none focus:ring-0"
            />
          </div>

          <div className="flex flex-col">
            <label className="pb-2 text-sm font-semibold">Número de mesa</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={number}
              onChange={(e) => setNumber(e.target.value.replace(/\D/g, ""))}
              placeholder="Ej: 12"
              disabled={pending}
              className="rounded-lg border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-3 text-sm placeholder:text-sm focus:border-[var(--color-button-send)] focus:outline-none focus:ring-0"
            />
          </div>

          <div className="flex flex-col">
            <label className="pb-2 text-sm font-semibold">Nombre de mesa</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Terraza norte"
              disabled={pending}
              className="rounded-lg border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-3 text-sm placeholder:text-sm focus:border-[var(--color-button-send)] focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3 px-0 text-sm font-bold sm:flex-row sm:gap-4 sm:px-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="flex cursor-pointer justify-center gap-2 rounded-xl bg-[var(--color-cancel)] p-3 px-4 text-black hover:bg-[var(--color-cancel-hover)] disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--color-button-send)] p-3 px-4 font-bold text-white transition hover:bg-[var(--color-button-send-hover)] disabled:opacity-60"
          >
            {pending ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}

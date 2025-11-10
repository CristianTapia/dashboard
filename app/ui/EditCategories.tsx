"use client";

import { useState, useTransition } from "react";
import { updateCategoryAction } from "@/app/dashboard/categorias/actions";

export default function EditCategories({
  categoryId,
  categoryName,
  onCancel,
  onSuccess,
}: {
  categoryId: number;
  categoryName: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}) {
  // Form states
  const [name, setName] = useState("");

  // State management
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) return alert("El nombre es obligatorio");

    startTransition(async () => {
      try {
        const res = await updateCategoryAction(categoryId, { name: name.trim() });
        if (res?.ok) {
          alert("Categoría editada ✅");
          setName("");
          onSuccess?.();
        }
      } catch (err: any) {
        alert(err?.message || "Error editando la categoría");
        console.error(err);
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl flex flex-col">
      <form onSubmit={onSubmit} className="flex flex-col gap-6 mt-6">
        {/* Nombre */}
        <div className="flex flex-col">
          <label className="text-sm pb-2 font-semibold">Nombre Actual</label>
          <div className="flex w-full items-center rounded-lg border border-gray-300 dark:border-gray-600 bg-[var(--color-cancel)] dark:bg-gray-700/50 p-3 mb-4">
            <p className="text-sm font-normal leading-normal text-gray-500 dark:text-gray-400">{categoryName}</p>
          </div>

          <label className="text-sm pb-2 font-semibold">Nuevo Nombre *</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Introduce nuevo nombre"
            disabled={pending}
            className="bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)]
                       focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 placeholder:text-sm text-sm"
            required
          />
        </div>

        {/* Botón */}
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
            {pending ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}

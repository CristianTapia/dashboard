"use client";

import { useState, useTransition } from "react";
import { Upload } from "lucide-react";
import { createCategoryAction } from "@/app/dashboard/categorias/actions";

export default function EditCategories() {
  // Form states
  const [name, setName] = useState("");

  // State management
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) return alert("El nombre es obligatorio");

    startTransition(async () => {
      try {
        const res = await createCategoryAction({
          name: name.trim(),
        });
        if (res?.ok) {
          alert("Categoría creada ✅");
          setName("");
        }
      } catch (err: any) {
        alert(err?.message || "Error agregando la categoría");
        console.error(err);
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl flex flex-col">
      <form onSubmit={onSubmit} className="flex flex-col gap-6 mt-6">
        {/* Nombre */}
        <div className="flex flex-col">
          <label className="text-sm pb-2 font-semibold">Nombre *</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Pizzas"
            disabled={pending}
            className="bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)]
                       focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3"
            required
          />
        </div>

        {/* Botón */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="p-3 bg-[var(--color-button-send)] text-white rounded-xl ml-2 cursor-pointer
                       disabled:opacity-60 inline-flex items-center justify-center gap-2 transition"
          >
            <Upload />
            {pending ? "Creando..." : "Agregar"}
          </button>
        </div>
      </form>
    </div>
  );
}

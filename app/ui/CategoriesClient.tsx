"use client";

import AddCategories from "@/app/ui/AddCategories";
import Modal from "@/app/ui/Modals/Modal";
import { useState } from "react";
import { CirclePlus, Search } from "lucide-react";
import { Category } from "@/app/lib/validators/types";

export default function CategoriesPage({ categories }: { categories: Category[] }) {
  const [activeModal, setActiveModal] = useState<null | "addCategory">(null);

  // MODAL
  function openModal(modalName: "addCategory") {
    setActiveModal(modalName);
    //   // setSelectedCategoryId(categoryId ?? null);
  }
  return (
    <div className="max-w-auto pt-4 flex flex-col">
      {/* Titulo */}
      <div className="flex flex-col items-start gap-2">
        <h1 className="text-3xl font-bold">Todas las Categorías</h1>
        <p className="text-md text-[var(--color-txt-secondary)]">
          Visualiza, edita o elimina las categorías existentes. Añadr nuevas categorías para organizar el contenido. Se
          visualizarán inmediatamente en el menú.
        </p>
      </div>

      {/* Añadir y buscar */}
      <div className="pt-6">
        {/* Boton añadir */}
        <button
          type="submit"
          onClick={() => openModal("addCategory")}
          className="p-2 pl-5 pr-5 bg-[var(--color-button-send)] text-white rounded-xl  cursor-pointer font-bold
                       disabled:opacity-60 inline-flex items-center justify-center gap-2 transition"
        >
          <CirclePlus /> Añadir nueva categoría
        </button>
        <Modal
          isOpen={activeModal === "addCategory"}
          onCloseAction={() => setActiveModal(null)}
          title="Añadir categoria"
          body={<AddCategories />}
        />
        {/* Busqueda */}
        <div className="flex w-full flex-1 items-stretch rounded-lg h-full pt-6">
          <div className="text-slate-500 dark:text-slate-400 flex bg-[var(--color-foreground)] dark:bg-background-dark items-center justify-center p-2 rounded-l-lg border border-[var(--color-border-box)] border-r-0">
            <Search />
          </div>
          <input
            type="name"
            name="search"
            className="w-full bg-[var(--color-foreground)] rounded-r-lg border border-[var(--color-border-box)]
                         focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3"
            placeholder="Buscar categorías por nombre"
            value=""
            onChange={() => {}}
          />
        </div>

        {/* Categorias */}
        {categories.map((categories) => (
          <div className="flex flex-col bg-white dark:bg-slate-800/50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex pt-4 items-start justify-between">
              <p className="text-[#0d141b] dark:text-white text-lg font-bold">{categories.name}</p>
              <div className="relative group gap-3">
                <button className="flex items-center justify-center size-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                  <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">:</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl z-10 hidden group-hover:block">
                  <a
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    href="#"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>Editar
                  </a>
                  <a
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    href="#"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>Eliminar
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

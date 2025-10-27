"use client";

import AddCategories from "@/app/ui/AddCategories";
import Modal from "@/app/ui/Modals/Modal";
import Dropdown from "@/app/ui/Dropdown";
import { useState } from "react";
import { CirclePlus, Search, EllipsisVertical, Pen, Trash } from "lucide-react";
import { Category } from "@/app/lib/validators/types";

export default function CategoriesPage({ categories }: { categories: Category[] }) {
  const [activeModal, setActiveModal] = useState<null | "addCategory">(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

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
        <div className="flex w-full flex-1 items-stretch rounded-lg h-full mt-6 mb-6">
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
        <div className="flex flex-wrap gap-8 justify-center">
          {categories.map((categories) => (
            <div
              key={categories.id}
              className="w-52 bg-[var(--color-foreground)] dark:bg-slate-800/50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between align-middle">
                <p className="dark:text-white text-lg font-bold">{categories.name}</p>
                <div className="relative group gap-3">
                  <button className="cursor-pointer flex items-center justify-center size-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                    <EllipsisVertical size={16} />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl hidden group-hover:block">
                    <Dropdown
                      isOpen={true}
                      optionA={
                        <div className="flex gap-2 vertical-center">
                          <Pen size={14} />
                          <span>Editar</span>
                        </div>
                      }
                      optionB={
                        <div className="flex gap-2 vertical-center">
                          <Trash size={14} />
                          <span>Eliminar</span>
                        </div>
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

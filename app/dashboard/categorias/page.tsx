"use client";

import AddCategories from "@/app/ui/AddCategories";
import Modal from "@/app/ui/Modals/Modal";
import { useState } from "react";
import { CirclePlus, Search } from "lucide-react";

export default function CategoriesPage() {
  const [activeModal, setActiveModal] = useState<null | "addCategory">(null);
  // const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId);
  // MODAL
  function openModal(modalName: "addCategory") {
    setActiveModal(modalName);
    //   // setSelectedCategoryId(categoryId ?? null);
  }
  return (
    <div className="mx-auto max-w-3xl pt-4 flex flex-col">
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
          className="p-3 pl-5 pr-5 bg-[var(--color-button-send)] text-white rounded-xl  cursor-pointer font-bold
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
            className="w-full bg-[var(--color-foreground)] rounded-r-lg border border-[var(--color-border-box)]
                         focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3"
            placeholder="Buscar categorías por nombre"
            value=""
          />
        </div>
      </div>
    </div>
  );
}

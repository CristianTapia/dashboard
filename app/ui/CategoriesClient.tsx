"use client";

import Dropdown from "@/app/ui/Dropdown";
import Modal from "@/app/ui/Modals/Modal";
import AddCategories from "@/app/ui/AddCategories";
import { useState, useRef, useEffect, useTransition } from "react";
import { Category } from "@/app/lib/validators/types";
import { CirclePlus, Search, EllipsisVertical, Pen, Trash } from "lucide-react";
import { deleteCategory } from "@/app/dashboard/categorias/actions";
import { useRouter } from "next/navigation";

export default function CategoriesPage({ categories }: { categories: Category[] }) {
  //DELETE CATEGORY
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // MODAL HANDLING
  const [activeModal, setActiveModal] = useState<null | "addCategory">(null);

  // DROPDOWN HANDLING
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  useEffect(() => {
    // Manejo de clics fuera del dropdown
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    // Manejo de escape para cerrar el dropdown
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenDropdownId(null);
      }
    }
    // Manejo de scroll para cerrar el dropdown
    function handleScroll() {
      setOpenDropdownId(null);
    }

    if (openDropdownId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      window.addEventListener("scroll", handleScroll, true);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [openDropdownId]);

  // MODAL
  function openModal(modalName: "addCategory") {
    setActiveModal(modalName);
  }

  // DELETE CATEGORY
  const onDelete = (id: number) => {
    startTransition(async () => {
      await deleteCategory(id);
      router.refresh(); // vuelve a renderizar con datos actualizados
    });
  };

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
          {categories.map((category) => (
            <div
              key={category.id}
              className="w-52 bg-[var(--color-foreground)] dark:bg-slate-800/50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <p className="dark:text-white text-lg font-bold">{category.name}</p>
                <div className="relative" ref={openDropdownId === category.id ? dropdownRef : null}>
                  <button
                    className="cursor-pointer flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdownId((prev) => (prev === category.id ? null : category.id));
                    }}
                  >
                    <EllipsisVertical size={18} />
                  </button>
                  <div>
                    <Dropdown
                      isOpen={openDropdownId === category.id}
                      optionA={
                        <div className="flex gap-2 items-center">
                          <Pen size={14} />
                          <span>Editar</span>
                        </div>
                      }
                      optionB={
                        <div
                          className="flex gap-2 items-center text-[var(--color-delete)]"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(category.id);
                          }}
                        >
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

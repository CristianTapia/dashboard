"use client";

import { tablesArray } from "../lib/data";
import { useState } from "react";
import Modal from "./Modals/Modal";
import Dropdown from "./Dropdown";
import AddTable from "./Modals/AddTable";

export default function Tables() {
  const [activeModal, setActiveModal] = useState<null | "addTable" | "confirmDelete">(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  function openModal(modalName: "addTable" | "confirmDelete") {
    setActiveModal(modalName);
  }

  function closeModal() {
    setActiveModal(null);
  }

  function toggleDropdown(id: number) {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="flex flex-col">
      <div className="text-white flex items-center gap-4 pb-8">
        <button
          onClick={() => openModal("addTable")} // Aquí se corrige el nombre de la función
          className="bg-red-500 border-1 p-2 rounded cursor-pointer"
        >
          Agregar Mesa
        </button>
        <input className="border-1 p-2 rounded" type="search" placeholder="Buscar Mesa" />
      </div>

      <div className="flex flex-wrap gap-8 justify-center">
        {tablesArray.map((option) => (
          <div key={option.id} className="relative box-border border p-4 rounded shadow-md bg-gray w-[200px]">
            <div className="flex justify-between items-center">
              <div className="w-32">Mesa {option.id}</div>
              {/* Contenedor con onBlur */}
              <div
                tabIndex={0} // Permite que onBlur funcione
                onBlur={() => setTimeout(() => setOpenDropdownId(null), 100)} // Se cierra si pierdo el foco
                className="relative"
              >
                <button onClick={() => toggleDropdown(option.id)} className="text-white p-2 py-1 rounded">
                  ⋮
                </button>
                {openDropdownId === option.id && (
                  <Dropdown
                    isOpen={true}
                    onDeleteAction={() => {
                      setOpenDropdownId(null);
                      openModal("confirmDelete");
                    }}
                  />
                )}
              </div>
            </div>
            <div className="w-32">{option.name}</div>
            <div className="flex justify-center gap-4 p-4">
              <div className="p-2 box-border border rounded">Atención</div>
              <div className="p-2 box-border border rounded">Cuenta</div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={activeModal === "addTable"}
        onCloseAction={closeModal}
        title="Agregar Mesa"
        body={<AddTable />}
        buttonAName="Agregar"
        buttonBName="Cerrar"
        onButtonAClickAction={closeModal}
        onButtonBClickAction={closeModal}
      />

      <Modal
        isOpen={activeModal === "confirmDelete"}
        onCloseAction={closeModal}
        title="¿Estás seguro/a?"
        body={<div>Esta acción es irreversible</div>}
        buttonAName="Eliminar"
        onButtonAClickAction={() => {
          // lógica de eliminar
          closeModal();
        }}
        buttonBName="Cancelar"
        onButtonBClickAction={closeModal}
      />
    </div>
  );
}

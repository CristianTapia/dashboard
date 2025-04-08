"use client";

import { tablesArray } from "../lib/data";
import { useState } from "react";
import Modal from "./Modals/Modal";
import Dropdown from "./Dropdown";
import AddTable from "./Modals/AddTable";

export default function Tables() {
  const [isModalOpen, setModalIsOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  function openConfirmModal() {
    setShowConfirmModal(true);
  }

  function closeConfirmModal() {
    setShowConfirmModal(false);
  }

  function toggleModal() {
    setModalIsOpen((prev) => !prev);
  }

  function toggleDropdown(id: number) {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="flex flex-col">
      <div className="text-white flex items-center gap-4 pb-8">
        <button onClick={toggleModal} className="bg-red-500 border-1 p-2 rounded cursor-pointer">
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
                      openConfirmModal();
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
        isOpen={isModalOpen}
        onCloseAction={toggleModal}
        title="Agregar Mesa"
        body={<AddTable />}
        buttonAName="Agregar"
        buttonBName="Cerrar"
        onButtonAClickAction={function (): void {
          throw new Error("Function not implemented.");
        }}
        onButtonBClickAction={function (): void {
          throw new Error("Function not implemented.");
        }}
      ></Modal>

      <Modal
        isOpen={showConfirmModal}
        onCloseAction={closeConfirmModal}
        title="¿Estás seguro/a?"
        body={<div>Esta acción es irreversible</div>}
        buttonAName="Eliminar"
        onButtonAClickAction={() => {
          // eliminar
          closeConfirmModal();
        }}
        buttonBName="Cancelar"
        onButtonBClickAction={closeConfirmModal}
      />
    </div>
  );
}

"use client";

import { tablesArray } from "../lib/data";
import { useState } from "react";
import Modal from "./Modal";
import Dropdown from "./Dropdown";

export default function Tables() {
  const [isModalOpen, setModalIsOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  function toggleModal() {
    setModalIsOpen((prev) => !prev);
  }

  function toggleDropdown(id: number) {
    setOpenDropdownId((prev) => (prev === id ? null : id)); // Si ya está abierto, lo cierra
  }

  function closeDropdown() {
    setOpenDropdownId(null);
  }

  return (
    <div onClick={closeDropdown} className="flex flex-col">
      <div className="text-white flex items-center gap-4 pb-8">
        <button
          onClick={(e) => {
            e.stopPropagation(); // Evita que cierre el dropdown
            toggleModal();
          }}
          className="bg-red-500 border-1 p-2 rounded"
        >
          Agregar Mesa
        </button>
        <input
          className="border-1 p-2 rounded"
          type="search"
          placeholder="Buscar Mesa"
          onClick={(e) => e.stopPropagation()} // Evita que cierre al hacer clic en el input
        />
      </div>

      <div className="flex flex-wrap gap-8 justify-center">
        {tablesArray.map((option) => (
          <div
            key={option.id}
            onClick={(e) => e.stopPropagation()} // Evita que cierre al hacer clic en la caja
            className="relative box-border border p-4 rounded shadow-md bg-gray w-[200px]"
          >
            <div className="flex justify-between items-center">
              <div className="w-32">Mesa {option.id}</div>
              <button
                onClick={() => {
                  toggleDropdown(option.id);
                }}
                className="text-white p-2 py-1 rounded"
              >
                ⋮
              </button>
              <Dropdown isOpen={openDropdownId === option.id} />
            </div>
            <div className="flex justify-center gap-4 p-4">
              <div className="p-2 box-border border rounded">Atención</div>
              <div className="p-2 box-border border rounded">Cuenta</div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onCloseAction={toggleModal} />
    </div>
  );
}

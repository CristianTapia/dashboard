"use client";

import { tablesArray } from "../lib/data";
import { useState } from "react";
import Modal from "./Modal";

export default function Tables() {
  const [isModalOpen, setModalIsOpen] = useState(false);

  function toggleModal() {
    setModalIsOpen((prev) => !prev);
  }

  return (
    <>
      <div className="flex flex-col">
        <div className="text-white flex items-center gap-4 pb-8">
          <button onClick={toggleModal} className="bg-red-500 border-1 p-2 rounded">
            Agregar Mesa
          </button>
          <input className="border-1 p-2 rounded" type="search" placeholder="Buscar Mesa" />
        </div>

        <div className="flex flex-wrap gap-8 justify-center">
          {tablesArray.map((option) => (
            <div key={option.id} className="box-border border p-4 rounded shadow-md bg-gray w-[200px]">
              <div className="flex justify-between items-center">
                <div className="w-32">Mesa {option.id}</div>
                {/* Dropdown */}
                <div className="relative inline-block text-left">
                  <button className="text-white p-2 py-1 rounded">O</button>
                  <div
                    className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black/5 focus:outline-hidden"
                    role="menu"
                  >
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700" role="menuitem">
                      Editar
                    </a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700" role="menuitem">
                      Eliminar
                    </a>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-4 p-4">
                <div className="p-2 box-border border rounded">Atención</div>
                <div className="p-2 box-border border rounded">Cuenta</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal box */}
      <Modal isOpen={isModalOpen} onCloseAction={toggleModal} />
    </>
  );
}

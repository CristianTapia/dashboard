"use client";

import { productArray } from "../lib/data";
import { useState } from "react";
import Modal from "./Modals/Modal";
import Dropdown from "./Dropdown";
import AddProduct from "./Modals/AddProduct";
import EditTable from "./Modals/EditTable";

export default function Tables() {
  const [activeModal, setActiveModal] = useState<null | "addProduct" | "confirmDelete" | "editTable">(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [selectedProductId, setselectedProductId] = useState<number | null>(null);
  const selectedProduct = productArray.find((product) => product.id === selectedProductId);

  // Modal
  function openModal(modalName: "addProduct" | "confirmDelete" | "editTable", productId?: number) {
    setActiveModal(modalName);
    setselectedProductId(productId ?? null);
  }

  function closeModal() {
    setActiveModal(null);
  }
  // Dropdown
  function toggleDropdown(id: number) {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="flex flex-col">
      <div className="text-white flex items-center gap-4 pb-8">
        <button
          onClick={() => openModal("addProduct")} // Aquí se corrige el nombre de la función
          className="bg-red-500 border-1 p-2 rounded cursor-pointer"
        >
          Agregar Producto
        </button>
        <input className="border-1 p-2 rounded" type="search" placeholder="Buscar Producto" />
      </div>

      <div className="flex flex-wrap gap-8 justify-center">
        {productArray.map((option) => (
          <div key={option.id} className="relative box-border border p-4 rounded shadow-md bg-gray w-[200px]">
            <div className="flex justify-between items-center">
              <div className="w-32">Producto {option.id}</div>
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
                    onEditAction={() => {
                      setOpenDropdownId(null);
                      openModal("editTable", option.id);
                    }}
                    onDeleteAction={() => {
                      setOpenDropdownId(null);
                      openModal("confirmDelete", option.id);
                    }}
                  />
                )}
              </div>
            </div>
            <div className="w-32 pb-1 pt-3">{option.name}</div>
            <div className="w-32 pb-1">
              {new Intl.NumberFormat("es-CL", {
                style: "currency",
                currency: "CLP",
                minimumFractionDigits: 0,
              }).format(option.price)}
            </div>
            <div className="w-32 pb-3">{option.category}</div>
            <div className="w-32 pb-3">Stock: {option.stock}</div>
            <div className="p-12 box-border border rounded">Foto</div>
          </div>
        ))}
      </div>

      {/* Modal para agregar producto */}
      <Modal
        isOpen={activeModal === "addProduct"}
        onCloseAction={closeModal}
        title="Agregar Producto"
        body={<AddProduct />}
        buttonAName="Agregar"
        buttonBName="Cancelar"
        onButtonAClickAction={closeModal}
        onButtonBClickAction={closeModal}
      />

      {/* Modal para editar producto */}
      <Modal
        isOpen={activeModal === "editTable"}
        onCloseAction={closeModal}
        title={`Editar Mesa ${selectedProduct?.id ?? ""}`}
        body={<EditTable />}
        buttonAName="Confirmar"
        onButtonAClickAction={() => {
          // lógica de editar
          closeModal();
        }}
        buttonBName="Cancelar"
        onButtonBClickAction={closeModal}
      />

      {/* Modal para confirmar eliminación */}
      <Modal
        isOpen={activeModal === "confirmDelete"}
        onCloseAction={closeModal}
        title={`¿Estás seguro/a de eliminar el producto ${selectedProduct?.id ?? ""}?`}
        body={<div className="text-gray-900">Esta acción es irreversible</div>}
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

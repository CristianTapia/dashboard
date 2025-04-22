"use client";

import { productArray } from "../lib/data";
import { useState } from "react";
import Modal from "./Modals/Modal";
import Dropdown from "./Dropdown";
import AddProduct from "./Modals/AddProduct";
import EditProduct from "./Modals/EditProduct";
import Filtering from "./Modals/Filtering";

export default function Products() {
  const [activeModal, setActiveModal] = useState<null | "addProduct" | "confirmDelete" | "editProduct" | "useFilter">(
    null
  );
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [selectedProductId, setselectedProductId] = useState<number | null>(null);
  const selectedProduct = productArray.find((product) => product.id === selectedProductId);
  const [showCategories, setShowCategories] = useState(false);
  const uniqueCategories = [...new Set(productArray.map((p) => p.category))];

  // Búsqueda y Filtro
  const [filters, setFilters] = useState({ term: "" });

  // Búsqueda y Filtro
  let filtered = [...productArray];

  if (filters.term.trim() !== "") {
    filtered = filtered.filter((product) => {
      const term = filters.term.toLowerCase();
      return product.name.toLowerCase().includes(term) || product.stock.toString().includes(term);
    });
  }

  const showProducts = filtered;

  // Modal
  function openModal(modalName: "addProduct" | "confirmDelete" | "editProduct" | "useFilter", productId?: number) {
    setActiveModal(modalName);
    setselectedProductId(productId ?? null);
  }

  function closeModal() {
    setActiveModal(null);
  }
  // Dropdown
  function toggleDropdown(id: number) {
    return setOpenDropdownId((prev) => (prev === id ? null : id));
  }

  //Filters
  function toggleButton() {
    setShowCategories((prev) => !prev);
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
        <input
          className="border-1 p-2 rounded"
          type="text"
          placeholder="Buscar Prodcuto"
          value={filters.term}
          onChange={(e) => {
            setFilters((prev) => ({ ...prev, term: e.target.value }));
          }}
        />
        <div className="relative inline-block">
          <button
            type="button"
            className="inline-flex justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
            onClick={() => openModal("useFilter")} // Aquí se corrige el nombre de la función}
          >
            Filtrar
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-8 justify-center">
        {showProducts.map((option) => (
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
                    optionA="Editar"
                    onOptionAClickAction={() => {
                      setOpenDropdownId(null);
                      openModal("editProduct", option.id);
                    }}
                    optionB="Eliminar"
                    onOptionBClickAction={() => {
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
        isOpen={activeModal === "editProduct"}
        onCloseAction={closeModal}
        title={`Editar Producto ${selectedProduct?.id ?? ""}`}
        body={<EditProduct />}
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

      {/* Modal para usar filtros */}
      <Modal
        isOpen={activeModal === "useFilter"}
        onCloseAction={closeModal}
        title={"Filtrar"}
        body={
          <Filtering
            onShowHideButtonClickAction={toggleButton}
            showHideButton={showCategories ? "Ocultar categorías" : "Mostrar categorías"}
            categories={
              showCategories && (
                <ul className="mt-2 space-y-2">
                  {uniqueCategories.map((category) => (
                    <li key={category} className="text-sm pl-2">
                      <input type="checkbox" />
                      <label className="ml-2">{category}</label>
                    </li>
                  ))}
                </ul>
              )
            }
          />
        }
        buttonAName="OK"
        onButtonAClickAction={() => {
          // lógica de aceptar
          closeModal();
        }}
        buttonBName="Cancelar"
        onButtonBClickAction={closeModal}
      />
    </div>
  );
}

// export default function SeeFilters() {
//   return (
//     <div className="flex flex-col gap-2">
//       <h2 className="text-lg font-semibold">Filtros</h2>
//       <div className="flex flex-col gap-2">
//         <div className="flex items-center gap-2">
//           <input type="checkbox" id="filter1" />
//           <label htmlFor="filter1">Filtro 1</label>
//         </div>
//         <div className="flex items-center gap-2">
//           <input type="checkbox" id="filter2" />
//           <label htmlFor="filter2">Filtro 2</label>
//         </div>
//       </div>
//     </div>
//   );
// }

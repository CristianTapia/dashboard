"use client";
import { Bell, DollarSign, ClipboardList } from "lucide-react";

import { tablesArray } from "../lib/data";
import { useState } from "react";
import Modal from "./Modals/Modal";
import Dropdown from "./Dropdown";
import AddTable from "./Modals/AddTable";
import EditTable from "./Modals/EditTable";

export default function Tables() {
  const [activeModal, setActiveModal] = useState<null | "addTable" | "confirmDelete" | "editTable" | "reviewOrder">(
    null
  );
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const selectedTable = tablesArray.find((table) => table.id === selectedTableId);
  const [isOpen, setIsOpen] = useState(false);

  // Búsqueda y Filtro
  const [filters, setFilters] = useState({ term: "" });
  const [sortBy, setSortBy] = useState<null | "category" | "stock">(null);

  // Búsqueda y Filtro
  let filtered = [...tablesArray];

  if (filters.term.trim() !== "") {
    filtered = filtered.filter((table) => {
      const term = filters.term.toLowerCase();
      return table.name.toLowerCase().includes(term) || table.number.toString().includes(term);
    });
  }

  if (sortBy === "category") {
    filtered.sort((a, b) => a.category.localeCompare(b.category));
  }

  if (sortBy === "stock") {
    filtered.sort((a, b) => a.stock.localeCompare(b.stock));
  }

  const showTables = filtered;

  // Modal
  function openModal(modalName: "addTable" | "confirmDelete" | "editTable" | "reviewOrder", tableId?: number) {
    setActiveModal(modalName);
    setSelectedTableId(tableId ?? null);
  }

  function closeModal() {
    setActiveModal(null);
  }
  // Dropdown
  function toggleDropdown(id?: number) {
    if (typeof id !== "number") {
      setIsOpen((prev) => !prev);
    } else {
      setOpenDropdownId((prev) => (prev === id ? null : id));
    }
    return;
  }

  return (
    <div className="flex flex-col">
      <div className="text-white flex items-center gap-4 pb-8">
        <button onClick={() => openModal("addTable")} className="bg-red-500 border-1 p-2 rounded cursor-pointer">
          Agregar Mesa
        </button>
        <input
          className="border-1 p-2 rounded"
          type="text"
          placeholder="Buscar Mesa"
          value={filters.term}
          onChange={(e) => {
            setFilters((prev) => ({ ...prev, term: e.target.value }));
          }}
        />
        <div className="relative inline-block" tabIndex={0} onBlur={() => setTimeout(() => setIsOpen(false), 100)}>
          <button
            type="button"
            className="inline-flex justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
            onClick={() => toggleDropdown()}
          >
            Ordenar por ⬇️
          </button>
          {isOpen && (
            <Dropdown
              className="top-[40px]"
              isOpen={true}
              optionA="Categoría"
              onOptionAClickAction={() => {
                setSortBy("category");
                setIsOpen(false);
              }}
              optionB="Stock"
              onOptionBClickAction={() => {
                setSortBy("stock");
                setIsOpen(false);
              }}
            />
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-8 justify-center">
        {showTables.map((option) => (
          <div key={option.id} className="relative box-border border p-4 rounded shadow-md bg-gray w-[200px]">
            <div className="flex justify-between items-center">
              <div className="w-32">Mesa {option.number}</div>
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
                      openModal("editTable", option.id);
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
            <div className="w-32">{option.name}</div>
            <div className="flex justify-center gap-4 p-4">
              {/* ALERTAS */}

              {/* Alerta Atención */}
              <div className="p-2 items-center gap-1 border rounded text-red-500 bg-red-100 animate-pulse">
                <Bell size={16} />
                <span className="text-sm">Atención</span>
              </div>

              {/* Alerta Cuenta */}
              <div className="p-2 items-center gap-1 border rounded text-yellow-600 bg-yellow-100 animate-pulse">
                <DollarSign size={16} />
                <span className="text-sm">Cuenta</span>
              </div>
            </div>
            <div className="flex justify-center gap-4 p-4 animate-pulse">
              <button
                className="p-2 items-center box-border border rounded bg-gray-200 text-black"
                onClick={() => {
                  openModal("reviewOrder", option.id);
                }}
              >
                <ClipboardList size={16} />
                Revisar Orden
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para agregar mesa */}
      <Modal
        isOpen={activeModal === "addTable"}
        onCloseAction={closeModal}
        title="Agregar Mesa"
        body={<AddTable />}
        buttonAName="Agregar"
        buttonBName="Cancelar"
        onButtonAClickAction={closeModal}
        onButtonBClickAction={closeModal}
      />

      {/* Modal para editar mesa */}
      <Modal
        isOpen={activeModal === "editTable"}
        onCloseAction={closeModal}
        title={`Editar Mesa ${selectedTable?.number ?? ""}`}
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
        title={`¿Estás seguro/a de eliminar la mesa ${selectedTable?.number ?? ""}?`}
        body={<div className="text-gray-900">Esta acción es irreversible</div>}
        buttonAName="Eliminar"
        onButtonAClickAction={() => {
          // lógica de eliminar
          closeModal();
        }}
        buttonBName="Cancelar"
        onButtonBClickAction={closeModal}
      />

      {/* Modal para Revisar la orden */}
      <Modal
        isOpen={activeModal === "reviewOrder"}
        onCloseAction={closeModal}
        title={`Orden de la Mesa ${selectedTable?.number ?? ""}`}
        body={
          <div className="text-gray-900">
            Ordenes que vienen desde la API intermendia que almacena los datos de la app menu
          </div>
        }
        buttonBName="Cerrar"
        onButtonBClickAction={closeModal}
      />
    </div>
  );
}

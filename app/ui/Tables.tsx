"use client";

import clsx from "clsx";

import { Bell, DollarSign, ClipboardList } from "lucide-react";
import { tablesArray, productsInCart } from "../lib/data";
import { useState, useEffect, useRef } from "react";
import Modal from "./Modals/Modal";
import Dropdown from "./Dropdown";
import AddTable from "./Modals/AddTable";
import EditTable from "./Modals/EditTable";
import Filtering from "./Modals/Filtering";
import FilteringButton from "./Modals/FilteringButton";

export default function Tables() {
  // Estados principales
  const [tables] = useState(tablesArray);
  const [sortedTables, setSortedTables] = useState(tablesArray);
  const [search, setSearch] = useState({ term: "" });

  const [activeModal, setActiveModal] = useState<
    null | "addTable" | "confirmDelete" | "editTable" | "reviewOrder" | "useFilter"
  >(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const selectedTable = tablesArray.find((table) => table.id === selectedTableId);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtros
  const [activeAssistanceOrder, setActiveAssistanceOrder] = useState<"yes" | "no" | null>(null);
  const [activeCheckOrder, setActiveCheckOrder] = useState<"yes" | "no" | null>(null);
  const [activeAlphabeticalOrder, setActiveAlphabeticalOrder] = useState<"asc" | "desc" | null>(null);

  // Estados temporales para los filtros
  const [tempActiveAssistanceOrder, setTempActiveAssistanceOrder] = useState<"yes" | "no" | null>(null);
  const [tempActiveCheckOrder, setTempActiveCheckOrder] = useState<"yes" | "no" | null>(null);
  const [tempActiveAlphabeticalOrder, setTempActiveAlphabeticalOrder] = useState<"asc" | "desc" | null>(null);

  // Búsqueda y Filtro
  useEffect(() => {
    let filtered = [...tables];

    // Filtro por búsqueda
    if (search.term.trim() !== "") {
      const normalize = (str: string) =>
        str
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();

      const term = normalize(search.term);
      filtered = filtered.filter((table) => normalize(table.name).includes(term));
    }

    // Ordenamiento combinado según prioridad
    filtered.sort((a, b) => {
      // 1. Orden alfabético
      if (activeAlphabeticalOrder) {
        const result = a.name.localeCompare(b.name);
        if (result !== 0) return activeAlphabeticalOrder === "asc" ? result : -result;
      }

      // 2. Orden por Atención
      if (activeAssistanceOrder) {
        const result = a.assistance - b.assistance;
        if (result !== 0) return activeAssistanceOrder === "no" ? result : -result;
      }

      // 3. Orden por Cuenta
      if (activeCheckOrder) {
        const result = a.check - b.check;
        if (result !== 0) return activeCheckOrder === "no" ? result : -result;
      }

      return 0;
    });

    setSortedTables(filtered);
  }, [tables, search.term, activeAlphabeticalOrder, activeAssistanceOrder, activeCheckOrder]);

  function resetFilters() {
    setTempActiveAlphabeticalOrder(null);
    setTempActiveAssistanceOrder(null);
    setActiveCheckOrder(null);
  }

  // Botones toggle de filtros
  function toggleTempActiveAlphabeticalOrder(value: "asc" | "desc") {
    setTempActiveAlphabeticalOrder((prev) => (prev === value ? null : value));
  }

  function toggleTempActiveAssistanceOrder(value: "yes" | "no") {
    setTempActiveAssistanceOrder((prev) => (prev === value ? null : value));
  }

  function toggleTempActiveCheckOrder(value: "yes" | "no") {
    setTempActiveCheckOrder((prev) => (prev === value ? null : value));
  }

  // Modal
  function openModal(
    modalName: "addTable" | "confirmDelete" | "editTable" | "reviewOrder" | "useFilter",
    tableId?: number
  ) {
    setActiveModal(modalName);
    setSelectedTableId(tableId ?? null);

    if (modalName === "useFilter") {
      setTempActiveAlphabeticalOrder(activeAlphabeticalOrder);
      setTempActiveAssistanceOrder(activeAssistanceOrder);
      setTempActiveCheckOrder(activeCheckOrder);
    }
  }

  function closeModal() {
    setActiveModal(null);
  }

  function toggleDropdown(id: number) {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  }

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
      document.removeEventListener("mousedown", handleClickOutside, false);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [openDropdownId]);

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
          value={search.term}
          onChange={(e) => {
            setSearch((prev) => ({ ...prev, term: e.target.value }));
          }}
        />
        <div className="relative inline-block">
          <div className="relative inline-block">
            <button
              type="button"
              className=" cursor-pointer inline-flex justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
              onClick={() => openModal("useFilter")}
            >
              Filtrar
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-8 justify-center">
        {sortedTables.map((option) => (
          <div key={option.id} className="relative box-border border p-4 rounded shadow-md bg-gray w-[200px]">
            <div className="flex justify-between items-center">
              <div className="w-32">Mesa {option.number}</div>
              <div className="relative">
                {openDropdownId === option.id ? (
                  // Simulación visual: se ve igual pero no reacciona
                  <div className="text-white p-2 py-1 rounded cursor-pointer select-none">⋮</div>
                ) : (
                  <button
                    onClick={() => {
                      toggleDropdown(option.id);
                    }}
                    className="text-white p-2 py-1 rounded cursor-pointer"
                  >
                    ⋮
                  </button>
                )}
                {openDropdownId === option.id && (
                  <Dropdown
                    ref={dropdownRef}
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
              {
                <div
                  className={clsx(
                    "p-2 items-center gap-1 border rounded text-red-500 bg-red-100 flex",
                    option.assistance === 1 ? "animate-pulse cursor-pointer" : ""
                  )}
                >
                  <Bell size={16} />
                  <span className="text-sm">Atención</span>
                </div>
              }

              {/* Alerta Cuenta */}
              <div
                className={clsx(
                  "p-2 items-center gap-1 border rounded text-yellow-600 bg-yellow-100 flex",
                  option.check === 1 ? "animate-pulse cursor-pointer" : ""
                )}
              >
                <DollarSign size={16} />
                <span className="text-sm">Cuenta</span>
              </div>
            </div>
            <div className="relative flex justify-center gap-4 p-4">
              <button
                className="p-2 items-center box-border border rounded bg-gray-200 text-black cursor-pointer"
                onClick={() => {
                  openModal("reviewOrder", option.id);
                }}
              >
                <ClipboardList size={16} />
                Revisar Orden
              </button>
              {/* Circulito rojo de notificación */}
              <span className="absolute text-center top-3 right-5 block h-6 w-6 rounded-full ring-1 ring-white bg-red-500">
                {productsInCart.reduce((acc, product) => acc + product.quantity, 0)}
              </span>
            </div>
            <div className="relative flex justify-center pt-4">
              <button className="p-2 items-center box-border border rounded bg-green-200 text-black cursor-pointer">
                Liberar Mesa
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
          <div className="space-y-4">
            {productsInCart.map((product) => (
              <div key={product.id} className="text-gray-900 flex flex-col">
                <div className="flex items-center w-full">
                  <div className="w-1/3 p-2 flex box-border border rounded justify-center">Foto</div>
                  <div className="w-2/3">
                    <div className="text-sm ml-2">{product.name}</div>
                    <div className="text-sm ml-2">
                      {new Intl.NumberFormat("es-CL", {
                        style: "currency",
                        currency: "CLP",
                        minimumFractionDigits: 0,
                      }).format(product.price)}
                    </div>
                  </div>
                  <div className="w-1/3 h-5 flex justify-center items-center text-sm border rounded">
                    {product.quantity}
                  </div>
                </div>
                <div className="flex items-center w-full text-sm">
                  <div className="w-1/2">Subtotal</div>
                  <div className="w-1/2 flex justify-end">
                    {new Intl.NumberFormat("es-CL", {
                      style: "currency",
                      currency: "CLP",
                      minimumFractionDigits: 0,
                    }).format(product.price * product.quantity)}
                  </div>
                </div>
                <div className="mb-2">------------------------------------------------------</div>
              </div>
            ))}
          </div>
        }
        fixedBody={
          <div className="flex items-center w-full mt-3 text-sm text-gray-900">
            <div className="w-1/2 font-semibold">Total</div>
            <div className="w-1/2 flex justify-end font-semibold">
              {new Intl.NumberFormat("es-CL", {
                style: "currency",
                currency: "CLP",
                minimumFractionDigits: 0,
              }).format(productsInCart.reduce((acc, product) => acc + product.price * product.quantity, 0))}
            </div>
          </div>
        }
        buttonBName="Cerrar"
        onButtonBClickAction={closeModal}
      />

      {/* Modal para filtrar */}
      <Modal
        isOpen={activeModal === "useFilter"}
        onCloseAction={closeModal}
        title="Filtrar"
        body={
          <Filtering
            onResetFiltersClickAction={resetFilters}
            // Orden por atención
            onShowHideStockClickAction={() => null}
            showHideStockButton="Ordenar por Atención"
            stock={
              <div className="text-gray-900 flex text-sm gap-1">
                <FilteringButton
                  onClick={() => toggleTempActiveAssistanceOrder("yes")}
                  variantClassName={clsx({
                    "bg-blue-300": tempActiveAssistanceOrder === "yes",
                    "bg-gray-300 text-white cursor-not-allowed": tempActiveAlphabeticalOrder !== null,
                    "cursor-pointer": tempActiveAlphabeticalOrder === null,
                  })}
                  text="Atención"
                  disabled={tempActiveAlphabeticalOrder !== null}
                />
                <FilteringButton
                  onClick={() => toggleTempActiveAssistanceOrder("no")}
                  variantClassName={clsx({
                    "bg-blue-300": tempActiveAssistanceOrder === "no",
                    "bg-gray-300 text-white cursor-not-allowed":
                      tempActiveAlphabeticalOrder !== null || tempActiveCheckOrder !== null,
                    "cursor-pointer": tempActiveAlphabeticalOrder === null && tempActiveAlphabeticalOrder === null,
                  })}
                  text="No Atención"
                  disabled={tempActiveAlphabeticalOrder !== null}
                />
              </div>
            }
            // Orden por Cuenta
            onShowHidePriceClickAction={() => null}
            showHidePriceButton="Ordenar por Cuenta"
            price={
              <div className="text-gray-900 flex text-sm gap-1">
                <FilteringButton
                  onClick={() => toggleTempActiveCheckOrder("yes")}
                  variantClassName={clsx({
                    "bg-blue-300": tempActiveCheckOrder === "yes",
                    "bg-gray-300 text-white cursor-not-allowed":
                      tempActiveAlphabeticalOrder !== null || tempActiveAssistanceOrder !== null,
                    "cursor-pointer": tempActiveAlphabeticalOrder === null && tempActiveAssistanceOrder === null,
                  })}
                  text="Cuenta"
                  disabled={tempActiveAlphabeticalOrder !== null}
                />
                <FilteringButton
                  onClick={() => toggleTempActiveCheckOrder("no")}
                  variantClassName={clsx({
                    "bg-blue-300": tempActiveCheckOrder === "no",
                    "bg-gray-300 text-white cursor-not-allowed":
                      tempActiveAlphabeticalOrder !== null || tempActiveAssistanceOrder !== null,
                    "cursor-pointer": tempActiveAlphabeticalOrder === null && tempActiveAssistanceOrder === null,
                  })}
                  text="No Cuenta"
                  disabled={tempActiveAlphabeticalOrder !== null}
                />
              </div>
            }
            // ORDEN ALFABÉTICO
            onShowHideAlphabeticalClickAction={() => null}
            showHideAlphabeticalButton="Ordenar Alfabéticamente"
            alphabetical={
              <div className="text-gray-900 flex text-sm gap-1">
                <FilteringButton
                  onClick={() => toggleTempActiveAlphabeticalOrder("asc")}
                  variantClassName={clsx({
                    "bg-blue-300": tempActiveAlphabeticalOrder === "asc",
                    "bg-gray-300 text-white cursor-not-allowed":
                      // tempActiveAssistanceOrder !== null || tempActivePriceOrder !== null,
                      tempActiveAssistanceOrder !== null,
                    // "cursor-pointer hover:bg-blue-300": tempActiveStockOrder === null && tempActivePriceOrder === null,
                    "cursor-pointer": tempActiveAssistanceOrder === null,
                  })}
                  text="A - Z"
                  // disabled={tempActiveStockOrder !== null || tempActivePriceOrder !== null}
                  disabled={tempActiveAssistanceOrder !== null}
                />
                <FilteringButton
                  onClick={() => toggleTempActiveAlphabeticalOrder("desc")}
                  variantClassName={clsx({
                    "bg-blue-300 ": tempActiveAlphabeticalOrder === "desc",
                    "bg-gray-300 text-white cursor-not-allowed": tempActiveAssistanceOrder !== null,
                    "cursor-pointer": tempActiveAssistanceOrder === null,
                  })}
                  text="Z - A"
                  disabled={tempActiveAssistanceOrder !== null}
                />
              </div>
            }
          />
        }
        buttonAName="Aplicar Filtros"
        onButtonAClickAction={() => {
          setActiveAssistanceOrder(tempActiveAssistanceOrder);
          setActiveAlphabeticalOrder(tempActiveAlphabeticalOrder);
          setActiveCheckOrder(tempActiveCheckOrder);
          closeModal();
        }}
        buttonBName="Cancelar"
        onButtonBClickAction={closeModal}
      />
    </div>
  );
}

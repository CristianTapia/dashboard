"use client";

import { productArray } from "../lib/data";
import { useState, useEffect } from "react";
import Modal from "./Modals/Modal";
import Dropdown from "./Dropdown";
import AddProduct from "./Modals/AddProduct";
import EditProduct from "./Modals/EditProduct";
import Filtering from "./Modals/Filtering";
import FilteringButton from "./Modals/FilteringButton";

export default function Products() {
  // Estados principales
  const [products] = useState(productArray);
  const [sortedProducts, setSortedProducts] = useState(productArray);
  const [search, setSearch] = useState({ term: "" });

  const [activeModal, setActiveModal] = useState<null | "addProduct" | "confirmDelete" | "editProduct" | "useFilter">(
    null
  );
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const selectedProduct = products.find((product) => product.id === selectedProductId);

  //Ordenamientos
  const [activeAlphabeticalOrder, setActiveAlphabeticalOrder] = useState<"asc" | "desc" | null>(null);
  const [activePriceOrder, setActivePriceOrder] = useState<"asc" | "desc" | null>(null);
  const [activeStockOrder, setActiveStockOrder] = useState<"asc" | "desc" | null>(null);

  // Filtros aplicados
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCategories, setShowCategories] = useState(true);

  //Confirmación de filtros aplicados
  const [confirmFilters, setConfirmFilters] = useState(false);

  const uniqueCategories = [...new Set(products.map((p) => p.category))];

  // FILTROS
  useEffect(() => {
    let filtered = [...products];

    // Filtro por búsqueda
    if (search.term.trim() !== "") {
      const term = search.term.toLowerCase();
      filtered = filtered.filter(
        (product) => product.name.toLowerCase().includes(term) || product.stock.toString().includes(term)
      );
    }

    // Filtro por categoría
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) => selectedCategories.includes(product.category));
    }

    // Ordenamiento combinado según prioridad
    filtered.sort((a, b) => {
      // 1. Orden alfabético
      if (activeAlphabeticalOrder) {
        const result = a.name.localeCompare(b.name);
        if (result !== 0) return activeAlphabeticalOrder === "asc" ? result : -result;
      }

      // 2. Orden por stock
      if (activeStockOrder) {
        const result = a.stock - b.stock;
        if (result !== 0) return activeStockOrder === "asc" ? result : -result;
      }

      // 3. Orden por precio
      if (activePriceOrder) {
        const result = a.price - b.price;
        if (result !== 0) return activePriceOrder === "asc" ? result : -result;
      }

      return 0;
    });

    setSortedProducts(filtered);
  }, [search.term, selectedCategories, products, activePriceOrder, activeStockOrder, activeAlphabeticalOrder]);

  // Reseteo de filtros si el modal se cierra y "Aplicar Filtros" no fue presionado
  // useEffect(() => {
  //   if (!activeModal && !confirmFilters) {
  //     setActivePriceOrder(null);
  //     setActiveStockOrder(null);
  //     setActiveAlphabeticalOrder(null);
  //     setSelectedCategories([]);
  //   }
  // }, [activeModal, confirmFilters]);

  function resetFilters() {
    setActivePriceOrder(null);
    setActiveStockOrder(null);
    setActiveAlphabeticalOrder(null);
    setSelectedCategories([]);
    setConfirmFilters(false);
  }

  // Botones toggle de filtros
  function toggleActivePriceOrder(value: "asc" | "desc") {
    setActivePriceOrder((prev) => (prev === value ? null : value));
  }

  function toggleActiveStockOrder(value: "asc" | "desc") {
    setActiveStockOrder((prev) => (prev === value ? null : value));
  }

  function toggleActiveAlphabeticalOrder(value: "asc" | "desc") {
    setActiveAlphabeticalOrder((prev) => (prev === value ? null : value));
  }

  // MODALES
  function openModal(modalName: "addProduct" | "confirmDelete" | "editProduct" | "useFilter", productId?: number) {
    setActiveModal(modalName);
    setSelectedProductId(productId ?? null);

    if (modalName === "useFilter") {
      setSelectedCategories(selectedCategories);
      setActivePriceOrder(activePriceOrder);
      setActiveStockOrder(activeStockOrder);
      setActiveAlphabeticalOrder(activeAlphabeticalOrder);
      setConfirmFilters(false);
    }
  }

  function closeModal() {
    setActiveModal(null);
  }

  function toggleDropdown(id: number) {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  }

  const handleTempCategoryChange = (category: string) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(category) ? prevSelected.filter((item) => item !== category) : [...prevSelected, category]
    );
  };

  // Renderizado
  return (
    <div className="flex flex-col">
      {/* Botonera */}
      <div className="text-white flex items-center gap-4 pb-8">
        <button onClick={() => openModal("addProduct")} className="bg-red-500 border-1 p-2 rounded cursor-pointer">
          Agregar Producto
        </button>

        <input
          className="border-1 p-2 rounded"
          type="text"
          placeholder="Buscar Producto"
          value={search.term}
          onChange={(e) => setSearch((prev) => ({ ...prev, term: e.target.value }))}
        />

        <div className="relative inline-block">
          <button
            type="button"
            className="inline-flex justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
            onClick={() => openModal("useFilter")}
          >
            Filtrar
          </button>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="flex flex-wrap gap-8 justify-center">
        {sortedProducts.map((option) => (
          <div key={option.id} className="relative box-border border p-4 rounded shadow-md bg-gray w-[200px]">
            <div className="flex justify-between items-center">
              <div className="w-32">Producto {option.id}</div>
              <div tabIndex={0} onBlur={() => setTimeout(() => setOpenDropdownId(null), 100)} className="relative">
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
            <div className="w-32 pb-1">{option.category}</div>
            <div className="w-32 pb-3">Stock: {option.stock}</div>
            <div className="p-12 box-border border rounded">Foto</div>
          </div>
        ))}
      </div>

      {/* Modales */}
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

      <Modal
        isOpen={activeModal === "editProduct"}
        onCloseAction={closeModal}
        title={`Editar Producto ${selectedProduct?.id ?? ""}`}
        body={<EditProduct />}
        buttonAName="Confirmar"
        onButtonAClickAction={closeModal}
        buttonBName="Cancelar"
        onButtonBClickAction={closeModal}
      />

      <Modal
        isOpen={activeModal === "confirmDelete"}
        onCloseAction={closeModal}
        title={`¿Eliminar producto ${selectedProduct?.id ?? ""}?`}
        body={<div className="text-gray-900">Esta acción es irreversible</div>}
        buttonAName="Eliminar"
        onButtonAClickAction={closeModal}
        buttonBName="Cancelar"
        onButtonBClickAction={closeModal}
      />

      <Modal
        isOpen={activeModal === "useFilter"}
        onCloseAction={closeModal}
        title="Filtrar"
        body={
          <Filtering
            onResetFiltersClickAction={resetFilters}
            // CATEGORÍAS
            onShowHideCategoryClickAction={() => setShowCategories((prev) => !prev)}
            showHideCategoryButton={showCategories ? "Ocultar Categorías" : "Mostrar Categorías"}
            category={
              showCategories && (
                <ul className="mt-2 space-y-2">
                  {uniqueCategories.map((category) => (
                    <li key={category} className="text-sm pl-2">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleTempCategoryChange(category)}
                      />
                      <label className="ml-2">{category}</label>
                    </li>
                  ))}
                </ul>
              )
            }
            // ORDEN POR STOCK
            onShowHideStockClickAction={() => null}
            showHideStockButton="Ordenar por Stock"
            stock={
              <div className="text-gray-900 flex text-sm gap-1">
                <FilteringButton
                  onClick={() => toggleActiveStockOrder("asc")}
                  variantClassName={activeStockOrder === "asc" ? "bg-blue-300" : "bg-white"}
                  text="Menor stock"
                />
                <FilteringButton
                  onClick={() => toggleActiveStockOrder("desc")}
                  variantClassName={activeStockOrder === "desc" ? "bg-blue-300" : "bg-white"}
                  text="Mayor stock"
                />
              </div>
            }
            // ORDEN POR PRECIO
            onShowHidePriceClickAction={() => null}
            showHidePriceButton="Ordenar por Precio"
            price={
              <div className="text-gray-900 flex text-sm gap-1">
                <FilteringButton
                  onClick={() => toggleActivePriceOrder("asc")}
                  variantClassName={activePriceOrder === "asc" ? "bg-blue-300" : "bg-white"}
                  text="Menor precio"
                />
                <FilteringButton
                  onClick={() => toggleActivePriceOrder("desc")}
                  variantClassName={activePriceOrder === "desc" ? "bg-blue-300" : "bg-white"}
                  text="Mayor precio"
                />
              </div>
            }
            // ORDEN ALFABÉTICO
            onShowHideAlphabeticalClickAction={() => null}
            showHideAlphabeticalButton="Ordenar Alfabéticamente"
            alphabetical={
              <div className="text-gray-900 flex text-sm gap-1">
                <FilteringButton
                  onClick={() => toggleActiveAlphabeticalOrder("asc")}
                  variantClassName={activeAlphabeticalOrder === "asc" ? "bg-blue-300" : "bg-white"}
                  text="A - Z"
                />
                <FilteringButton
                  onClick={() => toggleActiveAlphabeticalOrder("desc")}
                  variantClassName={activeAlphabeticalOrder === "desc" ? "bg-blue-300" : "bg-white"}
                  text="Z - A"
                />
              </div>
            }
          />
        }
        buttonAName="Aplicar Filtros"
        onButtonAClickAction={() => {
          setShowCategories(showCategories);
          setActivePriceOrder(activePriceOrder);
          setActiveStockOrder(activeStockOrder);
          setActiveAlphabeticalOrder(activeAlphabeticalOrder);
          setSelectedCategories(selectedCategories);
          setConfirmFilters(true);
          closeModal();
        }}
        buttonBName="Cancelar"
        onButtonBClickAction={() => {
          closeModal();
          resetFilters();
          setConfirmFilters(false);
        }}
      />
    </div>
  );
}

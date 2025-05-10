"use client";

import { productArray } from "../lib/data";
import { useState, useEffect, useRef } from "react";
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

  // Filtros
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCategories, setShowCategories] = useState(true);
  const [activeAlphabeticalOrder, setActiveAlphabeticalOrder] = useState<"asc" | "desc" | null>(null);
  const [activePriceOrder, setActivePriceOrder] = useState<"asc" | "desc" | null>(null);
  const [activeStockOrder, setActiveStockOrder] = useState<"asc" | "desc" | null>(null);

  // Estados temporales para los filtros
  const [tempSelectedCategories, setTempSelectedCategories] = useState<string[]>([]);
  const [tempActivePriceOrder, setTempActivePriceOrder] = useState<"asc" | "desc" | null>(null);
  const [tempActiveStockOrder, setTempActiveStockOrder] = useState<"asc" | "desc" | null>(null);
  const [tempActiveAlphabeticalOrder, setTempActiveAlphabeticalOrder] = useState<"asc" | "desc" | null>(null);

  const uniqueCategories = [...new Set(products.map((p) => p.category))];

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Manejo de clics fuera del dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenDropdownId(null);
      }
    }

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

  // FILTROS
  useEffect(() => {
    let filtered = [...products];

    // Filtro por búsqueda
    if (search.term.trim() !== "") {
      const normalize = (str: string) =>
        str
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();

      const term = normalize(search.term);
      filtered = filtered.filter(
        (product) => normalize(product.name).includes(term) || product.stock.toString().includes(term)
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
  //   if (!activeModal) {
  //     setActivePriceOrder(null);
  //     setActiveStockOrder(null);
  //     setActiveAlphabeticalOrder(null);
  //     setSelectedCategories([]);
  //   }
  // }, [activeModal]);

  function resetFilters() {
    setTempActivePriceOrder(null);
    setTempActiveStockOrder(null);
    setTempActiveAlphabeticalOrder(null);
    setTempSelectedCategories([]);
  }

  // Botones toggle de filtros
  function toggleTempActivePriceOrder(value: "asc" | "desc") {
    setTempActivePriceOrder((prev) => (prev === value ? null : value));
  }

  function toggleTempActiveStockOrder(value: "asc" | "desc") {
    setTempActiveStockOrder((prev) => (prev === value ? null : value));
  }

  function toggleTempActiveAlphabeticalOrder(value: "asc" | "desc") {
    setTempActiveAlphabeticalOrder((prev) => (prev === value ? null : value));
  }

  // MODALES
  function openModal(modalName: "addProduct" | "confirmDelete" | "editProduct" | "useFilter", productId?: number) {
    setActiveModal(modalName);
    setSelectedProductId(productId ?? null);

    if (modalName === "useFilter") {
      setTempSelectedCategories([...selectedCategories]);
      setTempActivePriceOrder(activePriceOrder);
      setTempActiveStockOrder(activeStockOrder);
      setTempActiveAlphabeticalOrder(activeAlphabeticalOrder);
    }
  }

  function closeModal() {
    setActiveModal(null);
  }

  function toggleDropdown(id: number) {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  }

  const handleTempCategoryChange = (category: string) => {
    setTempSelectedCategories((prevSelected) =>
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
            className="cursor-pointer inline-flex justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
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
              <div className="relative">
                <button
                  onClick={() => toggleDropdown(option.id)}
                  className="text-white p-2 py-1 rounded cursor-pointer"
                >
                  ⋮
                </button>
                {openDropdownId === option.id && (
                  <div ref={dropdownRef}>
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
                  </div>
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
                        checked={tempSelectedCategories.includes(category)}
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
                  onClick={() => toggleTempActiveStockOrder("asc")}
                  variantClassName={tempActiveStockOrder === "asc" ? "bg-blue-300" : "bg-white"}
                  text="Menor stock"
                />
                <FilteringButton
                  onClick={() => toggleTempActiveStockOrder("desc")}
                  variantClassName={tempActiveStockOrder === "desc" ? "bg-blue-300" : "bg-white"}
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
                  onClick={() => toggleTempActivePriceOrder("asc")}
                  variantClassName={tempActivePriceOrder === "asc" ? "bg-blue-300" : "bg-white"}
                  text="Menor precio"
                />
                <FilteringButton
                  onClick={() => toggleTempActivePriceOrder("desc")}
                  variantClassName={tempActivePriceOrder === "desc" ? "bg-blue-300" : "bg-white"}
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
                  onClick={() => toggleTempActiveAlphabeticalOrder("asc")}
                  variantClassName={tempActiveAlphabeticalOrder === "asc" ? "bg-blue-300" : "bg-white"}
                  text="A - Z"
                />
                <FilteringButton
                  onClick={() => toggleTempActiveAlphabeticalOrder("desc")}
                  variantClassName={tempActiveAlphabeticalOrder === "desc" ? "bg-blue-300" : "bg-white"}
                  text="Z - A"
                />
              </div>
            }
          />
        }
        buttonAName="Aplicar Filtros"
        onButtonAClickAction={() => {
          setShowCategories(showCategories);
          setActivePriceOrder(tempActivePriceOrder);
          setActiveStockOrder(tempActiveStockOrder);
          setActiveAlphabeticalOrder(tempActiveAlphabeticalOrder);
          setSelectedCategories(tempSelectedCategories);
          closeModal();
        }}
        buttonBName="Cancelar"
        onButtonBClickAction={() => {
          closeModal();
        }}
      />
    </div>
  );
}

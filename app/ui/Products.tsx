"use client";

import clsx from "clsx";

import { useState, useEffect, useRef, FormEvent } from "react";
import Modal from "./Modals/Modal";
import Dropdown from "./Dropdown";
import AddProduct from "./Modals/AddProduct";
import EditProduct from "./Modals/EditProduct";
import Filtering from "./Modals/Filtering";
import FilteringButton from "./Modals/FilteringButton";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock?: number;
  description?: string;
}

export default function Products({ products }: { products: Product[] }) {
  // Estados principales
  const [sortedProducts, setSortedProducts] = useState<Product[]>(products);
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
  const formRef = useRef<HTMLFormElement>(null);

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
        (product) =>
          normalize(product.name).includes(term) ||
          (typeof product.stock !== "undefined" && product.stock.toString().includes(term))
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
        const result = (a.stock ?? 0) - (b.stock ?? 0);
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

  function resetFilters() {
    setTempActivePriceOrder(null);
    setTempActiveStockOrder(null);
    setTempActiveAlphabeticalOrder(null);
    setTempSelectedCategories([]);
    setShowCategories(true);
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

  const handleTempCategoryChange = (category: string) => {
    setTempSelectedCategories((prevSelected) =>
      prevSelected.includes(category) ? prevSelected.filter((item) => item !== category) : [...prevSelected, category]
    );
  };

  function closeModal() {
    setActiveModal(null);
  }

  function toggleDropdown(id: number) {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  }

  // Manejo de clics fuera del dropdown
  useEffect(() => {
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
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [openDropdownId]);

  async function handleAddProduct(data: { name: string; price: number; stock?: number; categoryName: string }) {
    // 1) Upsert categoría → Supabase la crea si no existe
    const resCat = await fetch("/api/categories", {
      method: "POST",
      body: JSON.stringify({ name: data.categoryName }),
      headers: { "Content-Type": "application/json" },
    });
    const category = await resCat.json();
    const categoryId = category.id;

    // 2) Insertar producto apuntando al category_id
    const resProd = await fetch("/api/products", {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        price: data.price,
        stock: data.stock,
        categoryId,
      }),
      headers: { "Content-Type": "application/json" },
    });
    const created = await resProd.json();

    // 3) Agregar a la lista
    setSortedProducts((prev) => [
      {
        ...created,
        category: data.categoryName,
      },
      ...prev,
    ]);
  }

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
        {sortedProducts.map((option, index) => (
          <div key={index} className="relative box-border border p-4 rounded shadow-md bg-gray w-[200px]">
            <div className="flex justify-between items-center">
              <div className="w-32">Producto {option.id}</div>
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
        body={<AddProduct ref={formRef} onSubmitAction={handleAddProduct} />}
        buttonAName="Agregar"
        buttonBName="Cancelar"
        onButtonAClickAction={() => {
          formRef.current?.requestSubmit();
        }}
        onButtonBClickAction={closeModal}
      />

      <Modal
        isOpen={activeModal === "editProduct"}
        onCloseAction={closeModal}
        title={`Editar Producto ${selectedProduct?.id ?? ""}`}
        body={<EditProduct />}
        buttonAName="Confirmar"
        buttonBName="Cancelar"
        onButtonAClickAction={closeModal}
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
            // Categorías
            onShowHideFilterAClickAction={() => setShowCategories((prev) => !prev)}
            showHideFilterAButton={showCategories ? "Ocultar Categorías" : "Mostrar Categorías"}
            filterA={
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
            // Orden por Stock
            onShowHideFilterBClickAction={() => null}
            showHideFilterBButton="Ordenar por Stock"
            filterB={
              <div className="text-gray-900 flex text-sm gap-1">
                <FilteringButton
                  onClick={() => toggleTempActiveStockOrder("asc")}
                  variantClassName={clsx({
                    "bg-blue-300": tempActiveStockOrder === "asc",
                    "bg-gray-300 text-white cursor-not-allowed":
                      tempActivePriceOrder !== null || tempActiveAlphabeticalOrder !== null,
                    "cursor-pointer hover:bg-blue-300":
                      tempActivePriceOrder === null && tempActiveAlphabeticalOrder === null,
                  })}
                  text="Menor stock"
                  disabled={tempActivePriceOrder !== null || tempActiveAlphabeticalOrder !== null}
                />
                <FilteringButton
                  onClick={() => toggleTempActiveStockOrder("desc")}
                  variantClassName={clsx({
                    "bg-blue-300": tempActiveStockOrder === "desc",
                    "bg-gray-300 text-white cursor-not-allowed":
                      tempActivePriceOrder !== null || tempActiveAlphabeticalOrder !== null,
                    "cursor-pointer hover:bg-blue-300":
                      tempActivePriceOrder === null && tempActiveAlphabeticalOrder === null,
                  })}
                  text="Mayor stock"
                  disabled={tempActivePriceOrder !== null || tempActiveAlphabeticalOrder !== null}
                />
              </div>
            }
            // Ordn por Precio
            onShowHideFilterCClickAction={() => null}
            showHideFilterCButton="Ordenar por Precio"
            filterC={
              <div className="text-gray-900 flex text-sm gap-1">
                <FilteringButton
                  onClick={() => toggleTempActivePriceOrder("asc")}
                  variantClassName={clsx({
                    "bg-blue-300": tempActivePriceOrder === "asc",
                    "bg-gray-300 text-white cursor-not-allowed":
                      tempActiveStockOrder !== null || tempActiveAlphabeticalOrder !== null,
                    "cursor-pointer hover:bg-blue-300":
                      tempActiveStockOrder === null && tempActiveAlphabeticalOrder === null,
                  })}
                  text="Menor precio"
                  disabled={tempActiveStockOrder !== null || tempActiveAlphabeticalOrder !== null}
                />
                <FilteringButton
                  onClick={() => toggleTempActivePriceOrder("desc")}
                  variantClassName={clsx({
                    "bg-blue-300": tempActivePriceOrder === "desc",
                    "bg-gray-300 text-white cursor-not-allowed":
                      tempActiveStockOrder !== null || tempActiveAlphabeticalOrder !== null,
                    "cursor-pointer hover:bg-blue-300":
                      tempActiveStockOrder === null && tempActiveAlphabeticalOrder === null,
                  })}
                  text="Mayor precio"
                  disabled={tempActiveStockOrder !== null || tempActiveAlphabeticalOrder !== null}
                />
              </div>
            }
            // Orden Alfabético
            onShowHideFilterDClickAction={() => null}
            showHideFilterDButton="Ordenar Alfabéticamente"
            filterD={
              <div className="text-gray-900 flex text-sm gap-1">
                <FilteringButton
                  onClick={() => toggleTempActiveAlphabeticalOrder("asc")}
                  variantClassName={clsx({
                    "bg-blue-300": tempActiveAlphabeticalOrder === "asc",
                    "bg-gray-300 text-white cursor-not-allowed":
                      tempActiveStockOrder !== null || tempActivePriceOrder !== null,
                    "cursor-pointer hover:bg-blue-300": tempActiveStockOrder === null && tempActivePriceOrder === null,
                  })}
                  text="A - Z"
                  disabled={tempActiveStockOrder !== null || tempActivePriceOrder !== null}
                />
                <FilteringButton
                  onClick={() => toggleTempActiveAlphabeticalOrder("desc")}
                  variantClassName={clsx({
                    "bg-blue-300 ": tempActiveAlphabeticalOrder === "desc",
                    "bg-gray-300 text-white cursor-not-allowed":
                      tempActiveStockOrder !== null || tempActivePriceOrder !== null,
                    "cursor-pointer hover:bg-blue-300": tempActiveStockOrder === null && tempActivePriceOrder === null,
                  })}
                  text="Z - A"
                  disabled={tempActiveStockOrder !== null || tempActivePriceOrder !== null}
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
        onButtonBClickAction={closeModal}
      />
    </div>
  );
}

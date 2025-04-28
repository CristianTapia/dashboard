"use client";

import { productArray } from "../lib/data";
import { useState, useEffect } from "react";
import Modal from "./Modals/Modal";
import Dropdown from "./Dropdown";
import AddProduct from "./Modals/AddProduct";
import EditProduct from "./Modals/EditProduct";
import Filtering from "./Modals/Filtering";

export default function Products() {
  // Estados principales
  const [products] = useState(productArray);
  const [sortedProducts, setSortedProducts] = useState(productArray);
  const [filters, setFilters] = useState({ term: "" });

  const [activeModal, setActiveModal] = useState<null | "addProduct" | "confirmDelete" | "editProduct" | "useFilter">(
    null
  );
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const selectedProduct = products.find((product) => product.id === selectedProductId);

  // Filtros aplicados
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showStock, setShowStock] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showAlphabetical, setShowAlphabetical] = useState(true);

  const uniqueCategories = [...new Set(products.map((p) => p.category))];

  // Filtros temporales (para el modal)
  const [tempShowCategories, setTempShowCategories] = useState(false);
  const [tempSelectedCategories, setTempSelectedCategories] = useState<string[]>([]);
  const [tempShowStock, setTempShowStock] = useState(true);
  const [tempShowPrice, setTempShowPrice] = useState(true);
  const [tempShowAlphabetical, setTempShowAlphabetical] = useState(true);

  // Funciones de ordenamiento
  const sortByPrice = () => {
    setSortedProducts((prev) => [...prev].sort((a, b) => a.price - b.price));
  };

  const sortByStock = () => {
    setSortedProducts((prev) => [...prev].sort((a, b) => a.stock - b.stock));
  };

  const sortAlphabetically = () => {
    setSortedProducts((prev) => [...prev].sort((a, b) => a.name.localeCompare(b.name)));
  };

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...products];

    // Filtro por búsqueda
    if (filters.term.trim() !== "") {
      const term = filters.term.toLowerCase();
      filtered = filtered.filter(
        (product) => product.name.toLowerCase().includes(term) || product.stock.toString().includes(term)
      );
    }

    // Filtro por categoría
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) => selectedCategories.includes(product.category));
    }

    // Ordenamientos
    if (!showPrice && showStock) {
      filtered.sort((a, b) => a.stock - b.stock);
    } else if (showPrice && !showStock) {
      filtered.sort((a, b) => a.price - b.price);
    } else if (showAlphabetical && !showPrice && !showStock) {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setSortedProducts(filtered);
  }, [filters.term, selectedCategories, showStock, showPrice, showAlphabetical, products]);

  // Handlers
  function openModal(modalName: "addProduct" | "confirmDelete" | "editProduct" | "useFilter", productId?: number) {
    setActiveModal(modalName);
    setSelectedProductId(productId ?? null);

    if (modalName === "useFilter") {
      // Copiamos los filtros actuales al temporal
      setTempShowCategories(showCategories);
      setTempSelectedCategories(selectedCategories);
      setTempShowStock(showStock);
      setTempShowPrice(showPrice);
      setTempShowAlphabetical(showAlphabetical);
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
          value={filters.term}
          onChange={(e) => setFilters((prev) => ({ ...prev, term: e.target.value }))}
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

      {/* Modals */}
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
            onShowHideCategoryClickAction={() => setTempShowCategories((prev) => !prev)}
            showHideCategoryButton={tempShowCategories ? "Ocultar Categorías" : "Mostrar Categorías"}
            category={
              tempShowCategories && (
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
            onShowHideStockClickAction={() => setTempShowStock((prev) => !prev)}
            showHideStockButton={tempShowStock ? "Ocultar Stock" : "Mostrar Stock"}
            stock={
              tempShowStock && (
                <div className="text-gray-900 flex text-sm gap-1">
                  <button className="p-1 border-1 rounded">Mayor Stock</button>
                  <button onClick={sortByStock} className="p-1 border-1 rounded">
                    Menor Stock
                  </button>
                </div>
              )
            }
            onShowHidePriceClickAction={() => setTempShowPrice((prev) => !prev)}
            showHidePriceButton={tempShowPrice ? "Ocultar Precio" : "Mostrar Precio"}
            price={
              tempShowPrice && (
                <div className="text-gray-900 flex text-sm gap-1">
                  <button onClick={sortByPrice} className="p-1 border-1 rounded">
                    Menor Precio
                  </button>
                  <button className="p-1 border-1 rounded">Mayor Precio</button>
                </div>
              )
            }
            onShowHideAlphabeticalClickAction={() => setTempShowAlphabetical((prev) => !prev)}
            showHideAlphabeticalButton={tempShowAlphabetical ? "Ocultar Orden Alfabético" : "Mostrar Orden Alfabético"}
            alphabetical={
              tempShowAlphabetical && (
                <div className="text-gray-900 flex text-sm gap-1">
                  <button onClick={sortAlphabetically} className="p-1 border-1 rounded">
                    A-Z
                  </button>
                  <button className="p-1 border-1 rounded">Z-A</button>
                </div>
              )
            }
          />
        }
        buttonAName="OK"
        onButtonAClickAction={() => {
          // Aplicar cambios desde temporales
          setShowCategories(tempShowCategories);
          setSelectedCategories(tempSelectedCategories);
          setShowStock(tempShowStock);
          setShowPrice(tempShowPrice);
          setShowAlphabetical(tempShowAlphabetical);
          closeModal();
        }}
        buttonBName="Cancelar"
        onButtonBClickAction={closeModal}
      />
    </div>
  );
}

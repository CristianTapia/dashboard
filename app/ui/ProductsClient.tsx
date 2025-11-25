"use client";

import clsx from "clsx";
import { useState, useEffect, useRef, FormEvent } from "react";
import Modal from "./Modals/Modal";
import Dropdown from "./Dropdown";
import AddProduct from "./Modals/AddProduct";
import EditProduct from "./Modals/EditProduct";
import Filtering from "./Modals/Filtering";
import FilteringButton from "./Modals/FilteringButton";
import Image from "next/image";
import { Product, Category } from "../lib/validators/types";
import { useRouter } from "next/navigation";
import { CirclePlus, Trash, Pencil, Search } from "lucide-react";

export default function Products({
  products,
  initialCategories,
}: {
  products: Product[];
  initialCategories: Category[];
}) {
  // ESTADOS PRINCIPALES
  const [sortedProducts, setSortedProducts] = useState<Product[]>(products);
  const [search, setSearch] = useState({ term: "" });

  const [activeModal, setActiveModal] = useState<null | "addProduct" | "confirmDelete" | "editProduct" | "useFilter">(
    null
  );
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const selectedProduct = products.find((product) => product.id === selectedProductId);

  // ESTADOS DE FILTROS
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCategories, setShowCategories] = useState(true);
  const [activeAlphabeticalOrder, setActiveAlphabeticalOrder] = useState<"asc" | "desc" | null>(null);
  const [activePriceOrder, setActivePriceOrder] = useState<"asc" | "desc" | null>(null);
  const [activeStockOrder, setActiveStockOrder] = useState<"asc" | "desc" | null>(null);

  // ESTADOS TEMPORALES DE FILTROS (EN MODAL)
  const [tempSelectedCategories, setTempSelectedCategories] = useState<string[]>([]);
  const [tempActivePriceOrder, setTempActivePriceOrder] = useState<"asc" | "desc" | null>(null);
  const [tempActiveStockOrder, setTempActiveStockOrder] = useState<"asc" | "desc" | null>(null);
  const [tempActiveAlphabeticalOrder, setTempActiveAlphabeticalOrder] = useState<"asc" | "desc" | null>(null);

  // const uniqueCategories = [...new Set(products.map((p) => p.category ?? ""))].filter(Boolean);
  const router = useRouter();
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
      filtered = filtered.filter((product) => selectedCategories.includes(product.category?.name ?? ""));
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

  // Reseteo de filtros
  function resetFilters() {
    setTempActivePriceOrder(null);
    setTempActiveStockOrder(null);
    setTempActiveAlphabeticalOrder(null);
    setTempSelectedCategories([]);
    setShowCategories(true);
  }

  // BOTONES TOGGLE DE FILTROS
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

  const onSuccess = () => {
    console.log("Categoría agregada con éxito. Aquí podrías refrescar los datos.");
    // router.refresh(); // si usas App Router con fetch server-side
  };

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
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [openDropdownId]);

  // ELIMINAR PRODUCTO
  const handleDelete = async () => {
    const ok = window.confirm("¿Eliminar este producto? Esta acción no se puede deshacer.");
    if (!ok) return;

    const res = await fetch(`/api/products/${selectedProductId}`, { method: "DELETE" });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err?.error ?? "No se pudo eliminar");
      return;
    }

    // refresca la lista (SSR/Server Components)
    router.refresh();
  };

  // RENDERIZADO
  return (
    <div className="max-w-auto p-4 flex flex-col">
      <div className="flex flex-col items-start gap-2">
        <h1 className="text-3xl font-bold">Todos los Productos</h1>
        <p className="text-md text-[var(--color-txt-secondary)]">
          Visualiza los productos existentes. Los cambios se reflejarán inmediatamente en el menú.
        </p>
      </div>

      {/* Añadir y buscar */}
      <div className="mt-4">
        {/* Botón añadir */}
        <button
          type="button"
          onClick={() => openModal("addProduct")}
          className="p-2 pl-5 pr-5 bg-[var(--color-button-send)] text-white rounded-xl cursor-pointer font-bold disabled:opacity-60 inline-flex items-center justify-center gap-2 transition"
        >
          <CirclePlus /> Añadir nuevo producto
        </button>
        {/* Botonera */}
        <div className="text-white flex items-center gap-4 pb-8">
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
      </div>
      {/* Búsqueda */}
      <div className="flex w-full flex-1 items-stretch rounded-lg h-full mt-6 mb-6">
        <div className="text-slate-500 dark:text-slate-400 flex bg-[var(--color-foreground)] dark:bg-background-dark items-center justify-center p-2 rounded-l-lg border border-[var(--color-border-box)] border-r-0">
          <Search />
        </div>
        <input
          type="text"
          name="search"
          className="w-full bg-[var(--color-foreground)] rounded-r-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3"
          placeholder="Buscar productos por nombre"
          value={search.term}
          onChange={(e) => setSearch((prev) => ({ ...prev, term: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {sortedProducts.map((product) => (
          <div
            key={product.id}
            className="dark:bg-surface-dark rounded-xl shadow-card overflow-hidden flex flex-col bg-[var(--color-foreground)]"
          >
            <div className="relative">
              {product.image_url ? (
                <Image
                  alt={product.description || "Highlight Image"}
                  className="w-full h-36 object-cover"
                  src={product.image_url ?? ""}
                  width={400}
                  height={400}
                  unoptimized
                />
              ) : (
                <div className="w-full h-36 bg-gray-200 flex items-center justify-center text-gray-500">Sin imagen</div>
              )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">{product.name}</h3>
              <p className="text-sm text-red-300 mt-1 flex-grow">{product.description}</p>
              {/* <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <p className="text-md font-bold text-red-500">$75.00</p>
                  <p className="text-base text-text-light/50 dark:text-text-dark/50 line-through">$89.99</p>
                </div>
              </div> */}
              <p className="text-lg font-bold text-primary mt-4">
                {new Intl.NumberFormat("es-CL", {
                  style: "currency",
                  currency: "CLP",
                  minimumFractionDigits: 0,
                }).format(product.price)}
              </p>
              <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-4">Stock: 50</p>

              <p className="mt-1 text-sm text-text-light/70 dark:text-text-dark/70 flex-grow">
                {/* {product.description} */}
              </p>
              <div className="mt-4 pt-4 border-t border-[var(--color-border-box)] dark:border-border-dark flex items-center justify-end gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Oferta</span>
                  <button className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors">
                    <span className="sr-only">Activar oferta</span>
                    <span className="inline-block w-4 h-4 transform bg-white rounded-full transition-transform"></span>
                  </button>
                </div>
                <button
                  // onClick={() => openModal("editHighlight", highlight)}
                  className="cursor-pointer p-2 rounded-2xl text-[var(--color-light)] hover:text-[var(--color-light-hover)] hover:bg-[var(--color-cancel)] transition-colors"
                >
                  <Pencil size={18} />
                </button>
                <button
                  // onClick={() => openModal("confirmDelete", highlight)}
                  className="cursor-pointer p-2 rounded-2xl text-[var(--color-delete)] hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-[var(--color-delete-hover)] transition-colors"
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modales */}
      <Modal
        isOpen={activeModal === "addProduct"}
        onCloseAction={closeModal}
        title="Agregar Producto"
        body={
          <AddProduct
            ref={formRef}
            onSuccess={() => {
              onSuccess();
              closeModal();
            }}
            initialCategories={initialCategories as any}
          />
        }
        buttonAName="Agregar"
        buttonBName="Cancelar"
        onButtonAClickAction={() => {
          formRef.current?.requestSubmit();
        }}
        onButtonBClickAction={closeModal}
      />

      {selectedProduct && (
        <Modal
          isOpen={activeModal === "editProduct"}
          onCloseAction={closeModal}
          title={`Editar Producto ${selectedProduct.id}`}
          body={
            <EditProduct
              ref={formRef}
              onSuccess={() => {
                onSuccess();
                closeModal();
              }}
              product={selectedProduct}
              categories={initialCategories}
            />
          }
          buttonAName="Confirmar"
          buttonBName="Cancelar"
          onButtonAClickAction={() => {
            formRef.current?.requestSubmit();
          }}
          onButtonBClickAction={closeModal}
        />
      )}

      <Modal
        isOpen={activeModal === "confirmDelete"}
        onCloseAction={closeModal}
        title={`¿Eliminar producto ${selectedProduct?.id ?? ""}?`}
        body={<div className="text-gray-900">Esta acción es irreversible</div>}
        buttonAName="Eliminar"
        onButtonAClickAction={() => {
          handleDelete();
          closeModal();
        }}
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
                  {initialCategories.map((category) => (
                    <li key={category.id} className="text-sm pl-2">
                      <input
                        type="checkbox"
                        checked={tempSelectedCategories.includes(category.name)}
                        onChange={() => handleTempCategoryChange(category.name)}
                      />
                      <label className="ml-2">{category.name}</label>
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

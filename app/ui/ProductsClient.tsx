"use client";

import { useState, useTransition } from "react";
import Modal from "./Modals/Modal";
import EditProducts from "@/app/ui/EditProducts";
import Image from "next/image";
import { Product, Category } from "../lib/validators/types";
import { useRouter } from "next/navigation";
import { CirclePlus, Trash, Pencil, Search, TriangleAlert } from "lucide-react";
import { deleteProductAction } from "@/app/dashboard/productos/actions";

export default function Products({ products, categories }: { products: Product[]; categories: Category[] }) {
  // ESTADOS PRINCIPALES
  const [search, setSearch] = useState({ term: "" });

  const [activeModal, setActiveModal] = useState<null | "addProduct" | "confirmDelete" | "editProduct" | "useFilter">(
    null
  );
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string | null>(null);
  const [selectedProductPrice, setSelectedProductPrice] = useState<number | null>(null);
  const [selectedProductStock, setSelectedProductStock] = useState<number | null>(null);
  const [selectedProductDescription, setSelectedProductDescription] = useState<string | null>(null);
  const [selectedProductImageUrl, setSelectedProductImageUrl] = useState<string | null>(null);
  const [selectedProductImagePath, setSelectedProductImagePath] = useState<string | null>(null);
  const [selectedProductCategoryId, setSelectedProductCategoryId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Delete product logic
  const onDelete = (id: number) => {
    startTransition(async () => {
      await deleteProductAction(id);
      setActiveModal(null);
      router.refresh();
    });
  };

  // MODALES
  function openModal(
    modalName: "addProduct" | "confirmDelete" | "editProduct" | "useFilter",
    product?: Product | null
  ) {
    if (product) {
      setSelectedProductId(product.id ?? null);
      setSelectedProductName(product.name ?? null);
      setSelectedProductPrice(product.price ?? null);
      setSelectedProductStock(product.stock ?? null);
      setSelectedProductDescription(product.description ?? null);
      setSelectedProductImageUrl(product.image_url ?? null);
      setSelectedProductImagePath(product.image_path ?? null);
      setSelectedProductCategoryId(product.category?.id ?? null);
    }
    setActiveModal(modalName);
  }

  const onSuccess = () => {
    console.log("Categoría agregada con éxito. Aquí podrías refrescar los datos.");
    // router.refresh(); // si usas App Router con fetch server-side
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
        {products.map((product) => (
          <div
            key={product.id}
            className="dark:bg-surface-dark rounded-xl shadow-card overflow-hidden flex flex-col bg-[var(--color-foreground)]"
          >
            <div className="relative">
              {product.image_url ? (
                <Image
                  alt={product.description || "Product Image"}
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
              <p className="text-sm mt-1 flex-grow">{product.description}</p>
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
              <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-4">Stock: {product.stock}</p>

              <div className="mt-4 pt-4 border-t border-[var(--color-border-box)] dark:border-border-dark flex items-center justify-end gap-2">
                <button
                  onClick={() => openModal("editProduct", product)}
                  className="cursor-pointer p-2 rounded-2xl text-[var(--color-light)] hover:text-[var(--color-light-hover)] hover:bg-[var(--color-cancel)] transition-colors"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => openModal("confirmDelete", product)}
                  className="cursor-pointer p-2 rounded-2xl text-[var(--color-delete)] hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-[var(--color-delete-hover)] transition-colors"
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de edición de producto */}
      <Modal
        isOpen={activeModal === "editProduct"}
        icon={<Pencil color="#137fec" />}
        iconBgOptionalClassName="bg-[var(--color-bg-selected)]"
        onCloseAction={() => setActiveModal(null)}
        title={"Editar Producto"}
        fixedBody={
          <EditProducts
            productId={selectedProductId!}
            productName={selectedProductName!}
            productPrice={selectedProductPrice!}
            productStock={selectedProductStock!}
            productDescription={selectedProductDescription!}
            productImageUrl={selectedProductImageUrl}
            productImagePath={selectedProductImagePath}
            productCategoryId={selectedProductCategoryId}
            categories={categories}
            onSuccess={() => setActiveModal(null)}
          />
        }
      />

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={activeModal === "confirmDelete"}
        onCloseAction={() => setActiveModal(null)}
        icon={<TriangleAlert color="#DC2626" />}
        iconBgOptionalClassName="bg-[#fee2e2]"
        title={"Eliminar producto"}
        fixedBody={
          <div className="text-[var(--color-txt-secondary)] py-6 text-center text-sm flex flex-col gap-4 align-middle items-center">
            <p>
              ¿Estás seguro/a de que quieres eliminar este producto? <br />
              Esta acción no se puede deshacer.
            </p>
          </div>
        }
        buttonAName={"Cancelar"}
        buttonAOptionalClassName="bg-[var(--color-cancel)] text-black"
        onButtonAClickAction={() => {
          setActiveModal(null);
        }}
        buttonBName={isPending ? "Eliminando..." : "Eliminar"}
        buttonBOptionalClassName="bg-[var(--color-delete)] text-white"
        onButtonBClickAction={() => {
          if (selectedProductId != null) onDelete(selectedProductId);
        }}
      />
    </div>
  );
}

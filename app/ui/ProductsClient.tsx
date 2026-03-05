"use client";

import { useMemo, useState, useTransition } from "react";
import Modal from "./Modals/Modal";
import EditProducts from "@/app/ui/EditProducts";
import AddProducts from "@/app/ui/AddProducts";
import Image from "next/image";
import { Product, Category, TenantOption } from "../lib/validators/types";
import { useRouter } from "next/navigation";
import { CirclePlus, Trash, Pencil, Search, TriangleAlert, Upload } from "lucide-react";
import { deleteProductAction } from "@/app/dashboard/productos/actions";

export default function Products({
  products,
  categories,
  tenants,
  isAdmin,
  activeTenantId,
}: {
  products: Product[];
  categories: Category[];
  tenants: TenantOption[];
  isAdmin: boolean;
  activeTenantId: string;
}) {
  // ESTADOS PRINCIPALES
  const [search, setSearch] = useState({ term: "" });
  const [tenantFilter, setTenantFilter] = useState("all");

  const [activeModal, setActiveModal] = useState<null | "addProduct" | "confirmDelete" | "editProduct" | "useFilter">(
    null,
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
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
    product?: Product | null,
  ) {
    setSelectedProduct(product ?? null);
    setActiveModal(modalName);
  }

  const onSuccess = () => {
    console.log("Producto agregado con éxito. Aquí podrías refrescar los datos.");
    router.refresh(); // si usas App Router con fetch server-side
  };

  const tenantOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const product of products) {
      const tenantId = product.tenant_id ?? product.tenant?.id;
      const tenantName = product.tenant?.name;
      if (tenantId && tenantName) {
        map.set(tenantId, tenantName);
      }
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = search.term.trim().toLowerCase();
    return products.filter((product) => {
      const tenantId = product.tenant_id ?? product.tenant?.id ?? null;
      const byTenant = tenantFilter === "all" || tenantId === tenantFilter;
      const bySearch = !term || product.name.toLowerCase().includes(term);
      return byTenant && bySearch;
    });
  }, [products, search.term, tenantFilter]);

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
      <div className="flex w-full flex-1 items-stretch rounded-lg h-full mt-6 mb-6 gap-3">
        <select
          className="w-56 bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 text-sm"
          value={tenantFilter}
          onChange={(e) => setTenantFilter(e.target.value)}
        >
          <option value="all">Todos los tenants</option>
          {tenantOptions.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name}
            </option>
          ))}
        </select>
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
        {filteredProducts.map((product) => (
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
              {product.tenant?.name && (
                <p className="text-xs text-[var(--color-txt-secondary)] mb-1">Tenant: {product.tenant.name}</p>
              )}
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

      {/* Modal para añadir producto */}
      <Modal
        isOpen={activeModal === "addProduct"}
        icon={<Upload color="#137fec" />}
        iconBgOptionalClassName="bg-[var(--color-bg-selected)]"
        onCloseAction={() => setActiveModal(null)}
        title="Añadir Producto"
        body={
          <AddProducts
            categories={categories}
            tenants={tenants}
            isAdmin={isAdmin}
            activeTenantId={activeTenantId}
            onCancel={() => setActiveModal(null)}
            onSuccess={() => {
              setActiveModal(null);
              router.refresh();
            }}
          />
        }
      />

      {/* Modal de edición de producto */}
      <Modal
        isOpen={activeModal === "editProduct"}
        icon={<Pencil color="#137fec" />}
        iconBgOptionalClassName="bg-[var(--color-bg-selected)]"
        onCloseAction={() => setActiveModal(null)}
        title={"Editar Producto"}
        body={
          selectedProduct && (
            <EditProducts product={selectedProduct} categories={categories} onSuccess={() => setActiveModal(null)} />
          )
        }
      />

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={activeModal === "confirmDelete"}
        onCloseAction={() => setActiveModal(null)}
        icon={<TriangleAlert color="#DC2626" />}
        iconBgOptionalClassName="bg-[#fee2e2]"
        title={"Eliminar producto"}
        body={
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
          if (selectedProduct?.id != null) onDelete(selectedProduct.id);
        }}
      />
    </div>
  );
}

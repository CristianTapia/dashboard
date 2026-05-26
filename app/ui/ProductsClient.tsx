"use client";

import { useMemo, useState, useTransition } from "react";
import Modal from "./Modals/Modal";
import EditProducts from "@/app/ui/EditProducts";
import AddProducts from "@/app/ui/AddProducts";
import Image from "next/image";
import { Product, Category, TenantOption } from "../lib/validators/types";
import { useRouter } from "next/navigation";
import { CirclePlus, Trash, Pencil, Search, TriangleAlert, Upload } from "lucide-react";
import { deleteProductAction, updateProductActiveAction } from "@/app/dashboard/productos/actions";

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
  const [tenantFilter, setTenantFilter] = useState(isAdmin ? "all" : activeTenantId);

  const [activeModal, setActiveModal] = useState<null | "addProduct" | "confirmDelete" | "editProduct" | "useFilter">(
    null,
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [optimisticActiveById, setOptimisticActiveById] = useState<Record<number, boolean>>({});
  const [pendingActiveById, setPendingActiveById] = useState<Record<number, boolean>>({});
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function getProductActive(product: Product) {
    return optimisticActiveById[product.id] ?? product.active ?? true;
  }

  // Delete product logic
  const onDelete = (id: number) => {
    startTransition(async () => {
      await deleteProductAction(id);
      setActiveModal(null);
      router.refresh();
    });
  };

  function onToggleActive(product: Product) {
    const previousActive = getProductActive(product);
    const nextActive = !previousActive;
    setOptimisticActiveById((prev) => ({ ...prev, [product.id]: nextActive }));
    setPendingActiveById((prev) => ({ ...prev, [product.id]: true }));

    startTransition(async () => {
      try {
        await updateProductActiveAction(product.id, nextActive);
      } catch (err: unknown) {
        setOptimisticActiveById((prev) => ({ ...prev, [product.id]: previousActive }));
        const message = err instanceof Error ? err.message : "Error actualizando el producto";
        alert(message);
      } finally {
        setPendingActiveById((prev) => {
          const next = { ...prev };
          delete next[product.id];
          return next;
        });
      }
    });
  }

  // MODALES
  function openModal(
    modalName: "addProduct" | "confirmDelete" | "editProduct" | "useFilter",
    product?: Product | null,
  ) {
    setSelectedProduct(product ?? null);
    setActiveModal(modalName);
  }

  const tenantOptions = useMemo(() => {
    if (isAdmin) {
      return [...tenants].sort((a, b) => a.name.localeCompare(b.name));
    }

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
  }, [isAdmin, products, tenants]);

  const filteredProducts = useMemo(() => {
    const term = search.term.trim().toLowerCase();
    const effectiveTenantFilter = isAdmin ? tenantFilter : activeTenantId;

    return products.filter((product) => {
      const tenantId = product.tenant_id ?? product.tenant?.id ?? null;
      const byTenant = effectiveTenantFilter === "all" || tenantId === effectiveTenantFilter;
      const bySearch = !term || product.name.toLowerCase().includes(term);
      return byTenant && bySearch;
    });
  }, [activeTenantId, isAdmin, products, search.term, tenantFilter]);

  // RENDERIZADO
  return (
    <div className="w-full max-w-full p-2 sm:p-4 flex flex-col">
      <div className="flex flex-col items-start gap-1.5">
        <h1 className="text-2xl font-semibold sm:text-[1.7rem]">Productos</h1>
        <p className="max-w-2xl text-sm leading-6 text-[var(--color-txt-secondary)]">
          Visualiza los productos existentes. Los cambios se reflejarán inmediatamente en el menú.
        </p>
      </div>

      {/* Añadir y buscar */}
      <div className="mt-4">
        {/* Botón añadir */}
        <button
          type="button"
          onClick={() => openModal("addProduct")}
          className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--color-border-box)] bg-[var(--color-bg-selected)] px-4 text-sm font-medium text-[var(--color-txt-selected)] transition hover:border-[var(--color-button-send)] hover:bg-[var(--color-bg-selected)] disabled:opacity-60 sm:w-auto"
        >
          <CirclePlus size={18} /> Añadir producto
        </button>
      </div>
      {/* Búsqueda */}
      <div className="flex w-full flex-col sm:flex-row sm:items-stretch rounded-lg h-full mt-6 mb-6 gap-3">
        {isAdmin && (
          <select
            className="w-full sm:w-56 bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 text-sm"
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
        )}
        <div className="flex w-full">
          <div className="text-slate-500 dark:text-slate-400 flex bg-[var(--color-foreground)] dark:bg-background-dark items-center justify-center p-2 rounded-l-lg border border-[var(--color-border-box)] border-r-0">
            <Search />
          </div>
          <input
            type="text"
            name="search"
            className="w-full min-w-0 bg-[var(--color-foreground)] rounded-r-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3"
            placeholder="Buscar productos por nombre"
            value={search.term}
            onChange={(e) => setSearch((prev) => ({ ...prev, term: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4 sm:gap-6">
        {filteredProducts.map((product) => (
          (() => {
            const active = getProductActive(product);
            return (
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
                  {isAdmin && product.tenant?.name && (
                    <p className="text-xs text-[var(--color-txt-secondary)] mb-1">Tenant: {product.tenant.name}</p>
                  )}
                  <h3 className="text-lg font-semibold text-text-light dark:text-text-dark min-w-0">{product.name}</h3>
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
                  <div className="mt-4 flex items-center justify-between gap-1.5 border-t border-[var(--color-border-box)] pt-4 dark:border-border-dark">
                    <button
                      type="button"
                      disabled={Boolean(pendingActiveById[product.id])}
                      onClick={() => onToggleActive(product)}
                      className={`dashboard-status-toggle ${active ? "is-on" : "is-off"}`}
                      title={active ? "Marcar sin stock" : "Marcar disponible"}
                      aria-pressed={active}
                      aria-label={active ? "Producto con stock. Marcar sin stock" : "Producto sin stock. Marcar con stock"}
                    >
                      <span className="truncate">{active ? "Con stock" : "Sin stock"}</span>
                      <span
                        className="dashboard-status-track"
                        aria-hidden="true"
                      >
                        <span
                          className="dashboard-status-thumb"
                        />
                      </span>
                    </button>
                    <div className="flex shrink-0 items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openModal("editProduct", product)}
                        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-[var(--color-light)] transition-colors hover:bg-[var(--color-cancel)] hover:text-[var(--color-light-hover)]"
                        title="Editar producto"
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openModal("confirmDelete", product)}
                        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-[var(--color-delete)] transition-colors hover:bg-red-50 hover:text-[var(--color-delete-hover)] dark:hover:bg-red-900/20"
                        title="Eliminar producto"
                      >
                        <Trash size={17} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
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

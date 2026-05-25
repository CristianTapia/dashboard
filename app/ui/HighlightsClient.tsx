"use client";

import { useMemo, useState, useTransition } from "react";
import { TriangleAlert, Pencil, Trash, CirclePlus, Upload } from "lucide-react";
import { Highlight, TenantOption } from "../lib/validators/types";
import Image from "next/image";
import Modal from "@/app/ui/Modals/Modal";
import EditHighlights from "./EditHighlights";
import AddHighlights from "./AddHighlights";
import { useRouter } from "next/navigation";
import { deleteHighlightAction, updateHighlightActiveAction } from "@/app/dashboard/destacados/actions";

export default function AllHighlights({
  highlights,
  tenants,
  isAdmin,
  activeTenantId,
}: {
  highlights: Highlight[];
  tenants: TenantOption[];
  isAdmin: boolean;
  activeTenantId: string;
}) {
  const [activeModal, setActiveModal] = useState<null | "addHighlight" | "editHighlight" | "confirmDelete">(null);
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
  const [tenantFilter, setTenantFilter] = useState(isAdmin ? "all" : activeTenantId);
  const [optimisticActiveById, setOptimisticActiveById] = useState<Record<number, boolean>>({});
  const [pendingActiveById, setPendingActiveById] = useState<Record<number, boolean>>({});
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function getHighlightActive(highlight: Highlight) {
    return optimisticActiveById[highlight.id] ?? highlight.active ?? true;
  }

  function openModal(modalName: "addHighlight" | "editHighlight" | "confirmDelete", highlight?: Highlight | null) {
    setSelectedHighlight(highlight ?? null);
    setActiveModal(modalName);
  }

  const onDelete = (id: number) => {
    startTransition(async () => {
      await deleteHighlightAction(id);
      setActiveModal(null);
      // router.refresh();
    });
  };

  function onToggleActive(highlight: Highlight) {
    const previousActive = getHighlightActive(highlight);
    const nextActive = !previousActive;
    setOptimisticActiveById((prev) => ({ ...prev, [highlight.id]: nextActive }));
    setPendingActiveById((prev) => ({ ...prev, [highlight.id]: true }));

    startTransition(async () => {
      try {
        await updateHighlightActiveAction(highlight.id, nextActive);
      } catch (err: unknown) {
        setOptimisticActiveById((prev) => ({ ...prev, [highlight.id]: previousActive }));
        const message = err instanceof Error ? err.message : "Error actualizando el destacado";
        alert(message);
      } finally {
        setPendingActiveById((prev) => {
          const next = { ...prev };
          delete next[highlight.id];
          return next;
        });
      }
    });
  }

  const tenantOptions = useMemo(() => {
    if (isAdmin) {
      return [...tenants].sort((a, b) => a.name.localeCompare(b.name));
    }

    const map = new Map<string, string>();
    for (const highlight of highlights) {
      const tenantId = highlight.tenant_id ?? highlight.tenant?.id;
      const tenantName = highlight.tenant?.name;
      if (tenantId && tenantName) {
        map.set(tenantId, tenantName);
      }
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [highlights, isAdmin, tenants]);

  const filteredHighlights = useMemo(() => {
    const effectiveTenantFilter = isAdmin ? tenantFilter : activeTenantId;

    return highlights.filter((highlight) => {
      if (effectiveTenantFilter === "all") return true;
      const tenantId = highlight.tenant_id ?? highlight.tenant?.id ?? null;
      return tenantId === effectiveTenantFilter;
    });
  }, [activeTenantId, highlights, isAdmin, tenantFilter]);

  return (
    <div className="w-full max-w-full p-2 sm:p-4 flex flex-col">
      <div className="flex flex-col items-start gap-1.5">
        <h1 className="text-2xl font-semibold sm:text-[1.7rem]">Destacados</h1>
        <p className="max-w-2xl text-sm leading-6 text-[var(--color-txt-secondary)]">
          Visualiza las ofertas y destacados existentes. Los cambios se reflejarán inmediatamente en el menú.
        </p>
      </div>
      <div className="mt-4">
        {/* Botón añadir */}
        <button
          type="button"
          onClick={() => openModal("addHighlight")}
          className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--color-border-box)] bg-[var(--color-bg-selected)] px-4 text-sm font-medium text-[var(--color-txt-selected)] transition hover:border-[var(--color-button-send)] hover:bg-[var(--color-bg-selected)] disabled:opacity-60 sm:w-auto"
        >
          <CirclePlus size={18} /> Añadir destacado
        </button>
      </div>
      {isAdmin && (
        <div className="mt-4">
          <select
            className="w-full sm:w-56 bg-[var(--color-foreground)] rounded-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3 text-sm"
            value={tenantFilter}
            onChange={(e) => setTenantFilter(e.target.value)}
            disabled={tenantOptions.length === 0}
          >
            <option value="all">{tenantOptions.length === 0 ? "Global (sin tenant)" : "Todos los tenants"}</option>
            {tenantOptions.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4 sm:gap-6 mt-6">
        {filteredHighlights.map((highlight) => {
          const active = getHighlightActive(highlight);

          return (
            <div
              key={highlight.id}
              className="dark:bg-surface-dark rounded-xl shadow-card overflow-hidden flex flex-col bg-[var(--color-foreground)]"
            >
              <div className="relative">
                {highlight.image_url ? (
                  <Image
                    alt={highlight.description || "Highlight Image"}
                    className={`w-full h-36 object-cover transition-opacity ${active ? "opacity-100" : "opacity-60"}`}
                    src={highlight.image_url ?? ""}
                    width={400}
                    height={400}
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-36 bg-gray-200 flex items-center justify-center text-gray-500">Sin imagen</div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                {isAdmin && highlight.tenant?.name && (
                  <p className="text-xs text-[var(--color-txt-secondary)] mb-1">Tenant: {highlight.tenant.name}</p>
                )}
                <p className="mt-1 text-sm text-text-light/70 dark:text-text-dark/70 flex-grow">
                  {highlight.description}
                </p>
                <div className="mt-4 flex items-center justify-between gap-1.5 border-t border-[var(--color-border-box)] pt-4 dark:border-border-dark">
                  <button
                    type="button"
                    disabled={Boolean(pendingActiveById[highlight.id])}
                    onClick={() => onToggleActive(highlight)}
                    className={`inline-flex h-9 min-w-0 max-w-[8.75rem] flex-1 items-center justify-between gap-1.5 rounded-xl px-2 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 min-[360px]:gap-2 min-[360px]:px-2.5 min-[360px]:text-xs ${
                      active
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                    }`}
                    title={active ? "Desactivar destacado" : "Activar destacado"}
                    aria-pressed={active}
                    aria-label={active ? "Destacado activo. Desactivar destacado" : "Destacado inactivo. Activar destacado"}
                  >
                    <span className="truncate">{active ? "Activo" : "Inactivo"}</span>
                    <span
                      className={`relative h-6 w-10 shrink-0 rounded-full transition-colors duration-200 min-[360px]:w-11 ${
                        active ? "bg-emerald-500 dark:bg-emerald-400" : "bg-slate-400 dark:bg-slate-500"
                      }`}
                      aria-hidden="true"
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                          active ? "translate-x-4 min-[360px]:translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </span>
                  </button>
                  <div className="flex shrink-0 items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => openModal("editHighlight", highlight)}
                      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-[var(--color-light)] transition-colors hover:bg-[var(--color-cancel)] hover:text-[var(--color-light-hover)]"
                      title="Editar destacado"
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openModal("confirmDelete", highlight)}
                      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-[var(--color-delete)] transition-colors hover:bg-red-50 hover:text-[var(--color-delete-hover)] dark:hover:bg-red-900/20"
                      title="Eliminar destacado"
                    >
                      <Trash size={17} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para añadir destacado */}
      <Modal
        isOpen={activeModal === "addHighlight"}
        icon={<Upload color="#137fec" />}
        iconBgOptionalClassName="bg-[var(--color-bg-selected)]"
        onCloseAction={() => setActiveModal(null)}
        title="Añadir Destacado"
        fixedBody={
          <AddHighlights
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

      {/* Modal de edición de destacado */}
      <Modal
        isOpen={activeModal === "editHighlight"}
        icon={<Pencil color="#137fec" />}
        iconBgOptionalClassName="bg-[var(--color-bg-selected)]"
        onCloseAction={() => setActiveModal(null)}
        title={"Editar Destacado"}
        fixedBody={
          selectedHighlight && <EditHighlights highlight={selectedHighlight} onSuccess={() => setActiveModal(null)} />
        }
      />

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={activeModal === "confirmDelete"}
        onCloseAction={() => setActiveModal(null)}
        icon={<TriangleAlert color="#DC2626" />}
        iconBgOptionalClassName="bg-[#fee2e2]"
        title={"Eliminar destacado"}
        fixedBody={
          <div className="text-[var(--color-txt-secondary)] py-6 text-center text-sm flex flex-col gap-4 align-middle items-center">
            <p>
              ¿Estás seguro/a de que quieres eliminar este destacado? <br />
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
          if (selectedHighlight?.id != null) onDelete(selectedHighlight.id);
        }}
      />
    </div>
  );
}

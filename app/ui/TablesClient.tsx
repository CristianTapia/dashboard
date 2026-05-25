"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CirclePlus, Copy, ExternalLink, Pencil, Search, Table2, Trash, TriangleAlert, Upload } from "lucide-react";

import AddTable from "@/app/ui/AddTable";
import EditTable from "@/app/ui/EditTable";
import Modal from "@/app/ui/Modals/Modal";
import TableQrCode from "@/app/ui/TableQrCode";
import { deleteRestaurantTableAction, updateRestaurantTableActiveAction } from "@/app/dashboard/mesas/actions";
import { RestaurantTable, TenantOption } from "@/app/lib/validators/types";

export default function TablesClient({
  tables,
  tenants,
  isAdmin,
  activeTenantId,
}: {
  tables: RestaurantTable[];
  tenants: TenantOption[];
  isAdmin: boolean;
  activeTenantId: string;
}) {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<null | "addTable" | "confirmDelete" | "editTable">(null);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tenantFilter, setTenantFilter] = useState(isAdmin ? "all" : activeTenantId);
  const [optimisticActiveById, setOptimisticActiveById] = useState<Record<string, boolean>>({});
  const [pendingActiveById, setPendingActiveById] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();

  function getTableActive(table: RestaurantTable) {
    return optimisticActiveById[table.id] ?? table.active;
  }

  const tenantOptions = useMemo(() => {
    if (isAdmin) {
      return [...tenants].sort((a, b) => a.name.localeCompare(b.name));
    }

    const map = new Map<string, string>();
    for (const table of tables) {
      const tenantId = table.tenant_id ?? table.tenant?.id;
      const tenantName = table.tenant?.name;
      if (tenantId && tenantName) {
        map.set(tenantId, tenantName);
      }
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [isAdmin, tables, tenants]);

  const filteredTables = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const effectiveTenantFilter = isAdmin ? tenantFilter : activeTenantId;

    return tables.filter((table) => {
      const tenantId = table.tenant_id ?? table.tenant?.id ?? null;
      const byTenant = effectiveTenantFilter === "all" || tenantId === effectiveTenantFilter;
      const bySearch =
        !term ||
        table.label.toLowerCase().includes(term) ||
        table.public_token.toLowerCase().includes(term) ||
        (table.number ?? "").toLowerCase().includes(term) ||
        (table.name ?? "").toLowerCase().includes(term);
      return byTenant && bySearch;
    });
  }, [activeTenantId, isAdmin, searchTerm, tables, tenantFilter]);

  function copyToClipboard(value: string) {
    startTransition(async () => {
      try {
        await navigator.clipboard.writeText(value);
        alert("Link copiado");
      } catch {
        alert("No se pudo copiar el link");
      }
    });
  }

  function onToggleActive(table: RestaurantTable) {
    const previousActive = getTableActive(table);
    const nextActive = !previousActive;
    setOptimisticActiveById((prev) => ({ ...prev, [table.id]: nextActive }));
    setPendingActiveById((prev) => ({ ...prev, [table.id]: true }));

    startTransition(async () => {
      try {
        await updateRestaurantTableActiveAction(table.id, nextActive);
      } catch (err: unknown) {
        setOptimisticActiveById((prev) => ({ ...prev, [table.id]: previousActive }));
        const message = err instanceof Error ? err.message : "Error actualizando la mesa";
        alert(message);
      } finally {
        setPendingActiveById((prev) => {
          const next = { ...prev };
          delete next[table.id];
          return next;
        });
      }
    });
  }

  function openDeleteModal(table: RestaurantTable) {
    setSelectedTable(table);
    setActiveModal("confirmDelete");
  }

  function openEditModal(table: RestaurantTable) {
    setSelectedTable(table);
    setActiveModal("editTable");
  }

  function onDelete(table: RestaurantTable) {
    startTransition(async () => {
      try {
        await deleteRestaurantTableAction(table.id);
        setActiveModal(null);
        setSelectedTable(null);
        router.refresh();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error eliminando la mesa";
        alert(message);
      }
    });
  }

  return (
    <div className="flex w-full max-w-full flex-col p-2 sm:p-4">
      <div className="flex flex-col items-start gap-1.5">
        <h1 className="text-2xl font-semibold sm:text-[1.7rem]">Mesas</h1>
        <p className="max-w-2xl text-sm leading-6 text-[var(--color-txt-secondary)]">
          Administra el nombre de cada mesa y los links que se usarán en QR.
        </p>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => setActiveModal("addTable")}
          className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--color-border-box)] bg-[var(--color-bg-selected)] px-4 text-sm font-medium text-[var(--color-txt-selected)] transition hover:border-[var(--color-button-send)] hover:bg-[var(--color-bg-selected)] disabled:opacity-60 sm:w-auto"
        >
          <CirclePlus size={18} /> Añadir mesa
        </button>
      </div>

      <div className="mb-6 mt-6 flex h-full w-full flex-col gap-3 rounded-lg sm:flex-row sm:items-stretch">
        {isAdmin && (
          <select
            className="w-full rounded-lg border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-3 text-sm focus:border-[var(--color-button-send)] focus:outline-none focus:ring-0 sm:w-56"
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
          <div className="flex items-center justify-center rounded-l-lg border border-r-0 border-[var(--color-border-box)] bg-[var(--color-foreground)] p-2 text-slate-500">
            <Search />
          </div>
          <input
            type="text"
            name="search"
            className="w-full min-w-0 rounded-r-lg border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-3 focus:border-[var(--color-button-send)] focus:outline-none focus:ring-0"
            placeholder="Buscar mesas por nombre, número o token"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,420px))] justify-center gap-4 sm:gap-6">
        {filteredTables.map((table) => {
          const active = getTableActive(table);

          return (
            <div
              key={table.id}
              className="min-w-0 rounded-xl border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-4 shadow-sm transition-shadow hover:shadow-card sm:p-5"
            >
              <div className="flex items-center gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-bg-selected)] text-[var(--color-button-send)]">
                      <Table2 size={18} />
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold">{table.label}</h2>
                      {isAdmin && table.tenant?.name ? (
                        <p className="truncate text-xs text-[var(--color-txt-secondary)]">Tenant: {table.tenant.name}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-lg bg-[var(--color-bg-selected)] p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-txt-secondary)]">
                    Link público
                  </p>
                  <p className="mt-1 break-all text-sm">{table.short_url}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(table.short_url)}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--color-foreground)] px-3 py-2 text-sm hover:opacity-90"
                    >
                      <Copy size={14} />
                      Copiar
                    </button>
                    <a
                      href={table.short_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border-box)] bg-[var(--color-foreground)] px-3 py-2 text-sm"
                    >
                      <ExternalLink size={14} />
                      Abrir
                    </a>
                  </div>
                </div>

                <TableQrCode value={table.short_url} label={table.label} number={table.number} name={table.name} />

                <div className="flex items-center justify-between gap-1.5 border-t border-[var(--color-border-box)] pt-3">
                  <button
                    type="button"
                    disabled={Boolean(pendingActiveById[table.id])}
                    onClick={() => onToggleActive(table)}
                    className={`inline-flex h-9 min-w-0 max-w-[8.75rem] flex-1 items-center justify-between gap-1.5 rounded-xl px-2 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 min-[360px]:gap-2 min-[360px]:px-2.5 min-[360px]:text-xs ${
                      active
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                    }`}
                    title={active ? "Desactivar mesa" : "Activar mesa"}
                    aria-pressed={active}
                    aria-label={active ? "Mesa activa. Desactivar mesa" : "Mesa inactiva. Activar mesa"}
                  >
                    <span className="truncate">{active ? "Mesa activa" : "Mesa inactiva"}</span>
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
                      disabled={isPending}
                      onClick={() => openEditModal(table)}
                      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-[var(--color-light)] transition-colors hover:bg-[var(--color-cancel)] hover:text-[var(--color-light-hover)] disabled:opacity-60"
                      title="Editar mesa"
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => openDeleteModal(table)}
                      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-[var(--color-delete)] transition-colors hover:bg-red-50 hover:text-[var(--color-delete-hover)] disabled:opacity-60 dark:hover:bg-red-900/20"
                      title="Eliminar mesa"
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

      {filteredTables.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[var(--color-border-box)] p-10 text-center text-sm text-[var(--color-txt-secondary)]">
          Aún no hay mesas para los filtros seleccionados.
        </div>
      ) : null}

      <Modal
        isOpen={activeModal === "addTable"}
        icon={<Upload color="#137fec" />}
        iconBgOptionalClassName="bg-[var(--color-bg-selected)]"
        onCloseAction={() => setActiveModal(null)}
        title="Crear mesa"
        fixedBody={
          <AddTable
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

      <Modal
        isOpen={activeModal === "editTable"}
        icon={<Pencil color="#137fec" />}
        iconBgOptionalClassName="bg-[var(--color-bg-selected)]"
        onCloseAction={() => {
          setActiveModal(null);
          setSelectedTable(null);
        }}
        title={`Editar mesa ${selectedTable?.label ?? ""}`}
        fixedBody={
          selectedTable ? (
            <EditTable
              table={selectedTable}
              onCancel={() => {
                setActiveModal(null);
                setSelectedTable(null);
              }}
              onSuccess={() => {
                setActiveModal(null);
                setSelectedTable(null);
                router.refresh();
              }}
            />
          ) : null
        }
      />

      <Modal
        isOpen={activeModal === "confirmDelete"}
        onCloseAction={() => {
          setActiveModal(null);
          setSelectedTable(null);
        }}
        icon={<TriangleAlert color="#DC2626" />}
        iconBgOptionalClassName="bg-[#fee2e2]"
        title={`Eliminar mesa ${selectedTable?.label ?? ""}`}
        fixedBody={
          <div className="flex flex-col items-center gap-4 py-6 text-center text-sm text-[var(--color-txt-secondary)]">
            <p>Esta acción eliminará la mesa y dejará inutilizable su link público actual.</p>
            <p>No se puede deshacer.</p>
          </div>
        }
        buttonAName="Cancelar"
        buttonAOptionalClassName="bg-[var(--color-cancel)] text-black"
        onButtonAClickAction={() => {
          setActiveModal(null);
          setSelectedTable(null);
        }}
        buttonBName={isPending ? "Eliminando..." : "Eliminar"}
        buttonBOptionalClassName="bg-[var(--color-delete)] text-white"
        onButtonBClickAction={() => {
          if (selectedTable) onDelete(selectedTable);
        }}
      />
    </div>
  );
}

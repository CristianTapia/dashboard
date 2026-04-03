"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CirclePlus, Copy, ExternalLink, Search, Store, Table2, ToggleLeft, ToggleRight, Trash, TriangleAlert, Upload } from "lucide-react";

import AddTable from "@/app/ui/AddTable";
import Modal from "@/app/ui/Modals/Modal";
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
  const [activeModal, setActiveModal] = useState<null | "addTable" | "confirmDelete">(null);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tenantFilter, setTenantFilter] = useState("all");
  const [isPending, startTransition] = useTransition();

  const tenantOptions = useMemo(() => {
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
  }, [tables]);

  const filteredTables = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return tables.filter((table) => {
      const tenantId = table.tenant_id ?? table.tenant?.id ?? null;
      const byTenant = tenantFilter === "all" || tenantId === tenantFilter;
      const bySearch =
        !term ||
        table.label.toLowerCase().includes(term) ||
        table.public_token.toLowerCase().includes(term) ||
        (table.number ?? "").toLowerCase().includes(term) ||
        (table.name ?? "").toLowerCase().includes(term);
      return byTenant && bySearch;
    });
  }, [searchTerm, tables, tenantFilter]);

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
    startTransition(async () => {
      try {
        await updateRestaurantTableActiveAction(table.id, !table.active);
        router.refresh();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error actualizando la mesa";
        alert(message);
      }
    });
  }

  function openDeleteModal(table: RestaurantTable) {
    setSelectedTable(table);
    setActiveModal("confirmDelete");
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
    <div className="max-w-auto p-4 flex flex-col">
      <div className="flex flex-col items-start gap-2">
        <h1 className="text-3xl font-bold">Mesas</h1>
        <p className="text-md text-[var(--color-txt-secondary)]">
          Administra el nombre visible de cada mesa, su identificador publico y los links que se usaran en QR.
        </p>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => setActiveModal("addTable")}
          className="p-2 pl-5 pr-5 bg-[var(--color-button-send)] text-white rounded-xl cursor-pointer font-bold disabled:opacity-60 inline-flex items-center justify-center gap-2 transition"
        >
          <CirclePlus /> Añadir mesa
        </button>
      </div>

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
        <div className="text-slate-500 flex bg-[var(--color-foreground)] items-center justify-center p-2 rounded-l-lg border border-[var(--color-border-box)] border-r-0">
          <Search />
        </div>
        <input
          type="text"
          name="search"
          className="w-full bg-[var(--color-foreground)] rounded-r-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3"
          placeholder="Buscar mesas por nombre, numero o token"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredTables.map((table) => (
          <div
            key={table.id}
            className="rounded-xl bg-[var(--color-foreground)] border border-[var(--color-border-box)] p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Table2 size={18} />
                  <h2 className="text-lg font-semibold">{table.label}</h2>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      table.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {table.active ? "Activa" : "Inactiva"}
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-sm text-[var(--color-txt-secondary)]">
                  {table.tenant?.name ? (
                    <p className="flex items-center gap-2">
                      <Store size={14} />
                      Tenant: {table.tenant.name}
                    </p>
                  ) : null}
                  <p>Identificador publico: {table.public_token}</p>
                  {table.number ? <p>Numero visible: {table.number}</p> : null}
                  {table.name ? <p>Nombre visible: {table.name}</p> : null}
                </div>
              </div>

              <button
                type="button"
                disabled={isPending}
                onClick={() => onToggleActive(table)}
                className="cursor-pointer p-2 rounded-xl border border-[var(--color-border-box)] hover:bg-[var(--color-bg-selected)] disabled:opacity-60"
                title={table.active ? "Desactivar mesa" : "Activar mesa"}
              >
                {table.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-[var(--color-border-box)] p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-txt-secondary)]">
                  Link publico corto
                </p>
                <p className="text-xs text-[var(--color-txt-secondary)] mt-1">
                  Recomendado para QR. Usa solo el identificador publico de la mesa.
                </p>
                <p className="text-sm break-all mt-1">{table.short_url}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(table.short_url)}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-[var(--color-bg-selected)] hover:opacity-90 cursor-pointer"
                  >
                    <Copy size={14} />
                    Copiar
                  </button>
                  <a
                    href={table.short_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-[var(--color-border-box)]"
                  >
                    <ExternalLink size={14} />
                    Abrir
                  </a>
                </div>
              </div>

              <div className="rounded-lg border border-[var(--color-border-box)] p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-txt-secondary)]">
                  Link publico con tenant
                </p>
                <p className="text-xs text-[var(--color-txt-secondary)] mt-1">
                  Incluye el tenant en la URL ademas del identificador publico de la mesa.
                </p>
                <p className="text-sm break-all mt-1">{table.tenant_url}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(table.tenant_url)}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-[var(--color-bg-selected)] hover:opacity-90 cursor-pointer"
                  >
                    <Copy size={14} />
                    Copiar
                  </button>
                  <a
                    href={table.tenant_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-[var(--color-border-box)]"
                  >
                    <ExternalLink size={14} />
                    Abrir
                  </a>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => openDeleteModal(table)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-red-200 text-[var(--color-delete)] hover:bg-red-50 disabled:opacity-60 cursor-pointer"
                >
                  <Trash size={14} />
                  Eliminar mesa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTables.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[var(--color-border-box)] p-10 text-center text-sm text-[var(--color-txt-secondary)]">
          Aun no hay mesas para los filtros seleccionados.
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
        isOpen={activeModal === "confirmDelete"}
        onCloseAction={() => {
          setActiveModal(null);
          setSelectedTable(null);
        }}
        icon={<TriangleAlert color="#DC2626" />}
        iconBgOptionalClassName="bg-[#fee2e2]"
        title={`Eliminar mesa ${selectedTable?.label ?? ""}`}
        fixedBody={
          <div className="text-[var(--color-txt-secondary)] py-6 text-center text-sm flex flex-col gap-4 items-center">
            <p>
              Esta accion eliminara la mesa y dejara inutilizable su link publico actual.
            </p>
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

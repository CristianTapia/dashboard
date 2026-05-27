"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { CirclePlus, Palette, Pencil, Search, Trash, TriangleAlert, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import Modal from "@/app/ui/Modals/Modal";
import AddUsers from "@/app/ui/AddUsers";
import EditUsers from "@/app/ui/EditUsers";
import { deleteUserAction, updateTenantActiveAction } from "@/app/dashboard/usuarios/actions";
import { updateTenantMenuThemesEnabledAction } from "@/app/dashboard/themes/actions";

type UserTenantRow = {
  userId: string;
  loginName: string | null;
  email: string | null;
  role: string | null;
  tenantId: string | null;
  tenantName: string;
  tenantDomain: string | null;
  tenantActive: boolean;
  tenantAddress: string | null;
  tenantMapsUrl: string | null;
  tenantMenuThemesEnabled: boolean;
  tenantMenuTheme: string;
};

export default function UsuariosPage({ initialUsers }: { initialUsers: UserTenantRow[] }) {
  const [search, setSearch] = useState({ term: "" });
  const [rows, setRows] = useState<UserTenantRow[]>(initialUsers);
  const [activeModal, setActiveModal] = useState<null | "addUser" | "confirmDelete" | "editUser">(null);
  const [selectedRow, setSelectedRow] = useState<UserTenantRow | null>(null);
  const [pendingTenantById, setPendingTenantById] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function openModal(modalName: "addUser" | "confirmDelete" | "editUser", row?: UserTenantRow | null) {
    setSelectedRow(row ?? null);
    setActiveModal(modalName);
  }

  useEffect(() => {
    setRows(initialUsers);
  }, [initialUsers]);

  const filteredRows = useMemo(() => {
    const term = search.term.trim().toLowerCase();
    return rows.filter((r) => {
      if (!term) return true;
      return (
        r.loginName?.toLowerCase().includes(term) ||
        r.email?.toLowerCase().includes(term) ||
        r.tenantName.toLowerCase().includes(term) ||
        (r.tenantDomain ?? "").toLowerCase().includes(term) ||
        r.role?.toLowerCase().includes(term) ||
        (r.tenantActive ? "activo" : "inactivo").includes(term)
      );
    });
  }, [rows, search.term]);

  const onDelete = (tenantId: string) => {
    startTransition(async () => {
      await deleteUserAction(tenantId);
      setActiveModal(null);
      setSelectedRow(null);
      router.refresh();
    });
  };

  function onToggleTenantActive(row: UserTenantRow) {
    if (!row.tenantId) return;

    const nextActive = !row.tenantActive;
    setRows((current) =>
      current.map((item) => (item.tenantId === row.tenantId ? { ...item, tenantActive: nextActive } : item)),
    );
    setPendingTenantById((prev) => ({ ...prev, [row.tenantId!]: true }));

    startTransition(async () => {
      try {
        await updateTenantActiveAction(row.tenantId!, nextActive);
      } catch (err: unknown) {
        setRows((current) =>
          current.map((item) => (item.tenantId === row.tenantId ? { ...item, tenantActive: row.tenantActive } : item)),
        );
        const message = err instanceof Error ? err.message : "Error actualizando el tenant";
        alert(message);
      } finally {
        setPendingTenantById((prev) => {
          const next = { ...prev };
          delete next[row.tenantId!];
          return next;
        });
      }
    });
  }

  function onToggleTenantThemes(row: UserTenantRow) {
    if (!row.tenantId) return;

    const nextEnabled = !row.tenantMenuThemesEnabled;
    setRows((current) =>
      current.map((item) =>
        item.tenantId === row.tenantId ? { ...item, tenantMenuThemesEnabled: nextEnabled } : item,
      ),
    );
    setPendingTenantById((prev) => ({ ...prev, [`themes-${row.tenantId}`]: true }));

    startTransition(async () => {
      try {
        await updateTenantMenuThemesEnabledAction(row.tenantId!, nextEnabled);
      } catch (err: unknown) {
        setRows((current) =>
          current.map((item) =>
            item.tenantId === row.tenantId
              ? { ...item, tenantMenuThemesEnabled: row.tenantMenuThemesEnabled }
              : item,
          ),
        );
        const message = err instanceof Error ? err.message : "Error actualizando themes";
        alert(message);
      } finally {
        setPendingTenantById((prev) => {
          const next = { ...prev };
          delete next[`themes-${row.tenantId}`];
          return next;
        });
      }
    });
  }

  return (
    <div className="w-full max-w-full p-2 sm:p-4 flex flex-col">
      <div className="flex flex-col items-start gap-1.5">
        <h1 className="text-2xl font-semibold sm:text-[1.7rem]">Usuarios</h1>
        <p className="max-w-2xl text-sm leading-6 text-[var(--color-txt-secondary)]">
          Administra nombre, rol y clave publica de cada tenant.
        </p>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => openModal("addUser")}
          className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--color-border-box)] bg-[var(--color-bg-selected)] px-4 text-sm font-medium text-[var(--color-txt-selected)] transition hover:border-[var(--color-button-send)] hover:bg-[var(--color-bg-selected)] disabled:opacity-60 sm:w-auto"
        >
          <CirclePlus size={18} /> Añadir usuario
        </button>
      </div>

      <div className="flex w-full flex-1 items-stretch rounded-lg h-full mt-6 mb-6">
        <div className="text-slate-500 dark:text-slate-400 flex bg-[var(--color-foreground)] dark:bg-background-dark items-center justify-center p-2 rounded-l-lg border border-[var(--color-border-box)] border-r-0">
          <Search />
        </div>
        <input
          type="text"
          name="search"
          className="w-full bg-[var(--color-foreground)] rounded-r-lg border border-[var(--color-border-box)] focus:outline-none focus:ring-0 focus:border-[var(--color-button-send)] p-3"
          placeholder="Buscar por acceso, email, tenant, clave o rol"
          value={search.term}
          onChange={(e) => setSearch((prev) => ({ ...prev, term: e.target.value }))}
        />
      </div>

      <section className="bg-[var(--color-foreground)] border border-[var(--color-line-limit)] rounded-xl p-3 sm:p-6">
        <h2 className="text-lg font-semibold mb-2">Usuarios del tenant</h2>
        {filteredRows.length === 0 ? (
          <p className="text-sm text-[var(--color-txt-secondary)]">Aun no hay usuarios.</p>
        ) : (
          <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-[var(--color-line-limit)]">
                  <th className="py-2">Email</th>
                  <th className="py-2">Acceso</th>
                  <th className="py-2">Tenant</th>
                  <th className="py-2">Clave publica</th>
                  <th className="py-2">Rol</th>
                  <th className="py-2">Estado</th>
                  <th className="py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={`${row.userId}-${row.tenantId}`} className="border-b border-[var(--color-line-limit)]">
                    <td className="py-2">{row.email ?? "Sin email"}</td>
                    <td className="py-2 font-mono text-xs">{row.loginName ?? "Sin acceso"}</td>
                    <td className="py-2">{row.tenantName}</td>
                    <td className="py-2 font-mono text-xs">{row.tenantDomain ?? row.tenantId ?? "Sin clave"}</td>
                    <td className="py-2">{row.role ?? "Sin rol"}</td>
                    <td className="py-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          row.tenantActive
                            ? "bg-sky-100 text-sky-800 dark:bg-cyan-400/12 dark:text-cyan-100"
                            : "bg-slate-200 text-slate-700 dark:bg-slate-700/70 dark:text-slate-300"
                        }`}
                      >
                        {row.tenantActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="py-2">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={!row.tenantId || Boolean(row.tenantId && pendingTenantById[row.tenantId])}
                          onClick={() => onToggleTenantActive(row)}
                          className={`dashboard-status-toggle min-w-[8.75rem] ${row.tenantActive ? "is-on" : "is-off"}`}
                          title={row.tenantActive ? "Desactivar tenant" : "Activar tenant"}
                          aria-pressed={row.tenantActive}
                        >
                          <span className="truncate">{row.tenantActive ? "Activo" : "Inactivo"}</span>
                          <span
                            className="dashboard-status-track"
                            aria-hidden="true"
                          >
                            <span
                              className="dashboard-status-thumb"
                            />
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleTenantThemes(row)}
                          className={`inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                            row.tenantMenuThemesEnabled
                              ? "bg-[var(--color-bg-selected)] text-[var(--color-txt-selected)] hover:border-[var(--color-button-send)]"
                              : "text-[var(--color-light)] hover:bg-[var(--color-cancel)] hover:text-[var(--color-light-hover)]"
                          }`}
                          disabled={!row.tenantId || Boolean(row.tenantId && pendingTenantById[`themes-${row.tenantId}`])}
                          title={row.tenantMenuThemesEnabled ? "Deshabilitar themes" : "Habilitar themes"}
                          aria-pressed={row.tenantMenuThemesEnabled}
                        >
                          <Palette size={16} />
                          <span>{row.tenantMenuThemesEnabled ? "Themes on" : "Themes"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openModal("editUser", row)}
                          className="cursor-pointer p-2 rounded-2xl text-[var(--color-light)] hover:text-[var(--color-light-hover)] hover:bg-[var(--color-cancel)] transition-colors"
                          disabled={!row.tenantId}
                          title="Editar tenant"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openModal("confirmDelete", row)}
                          className="cursor-pointer p-2 rounded-2xl text-[var(--color-delete)] hover:bg-red-50 hover:text-[var(--color-delete-hover)] transition-colors disabled:opacity-50"
                          disabled={!row.tenantId}
                          title="Eliminar tenant"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        isOpen={activeModal === "addUser"}
        icon={<Upload color="#137fec" />}
        iconBgOptionalClassName="bg-[var(--color-bg-selected)]"
        onCloseAction={() => setActiveModal(null)}
        title="Añadir usuario"
        fixedBody={
          <AddUsers
            onCancel={() => setActiveModal(null)}
            onSuccess={() => {
              setActiveModal(null);
              router.refresh();
            }}
          />
        }
      />

      <Modal
        isOpen={activeModal === "editUser"}
        icon={<Pencil color="#137fec" />}
        iconBgOptionalClassName="bg-[var(--color-bg-selected)]"
        onCloseAction={() => setActiveModal(null)}
        title="Editar tenant"
        fixedBody={
          selectedRow?.tenantId ? (
            <EditUsers
              userId={selectedRow.userId}
              tenantId={selectedRow.tenantId}
              tenantName={selectedRow.tenantName}
              tenantDomain={selectedRow.tenantDomain}
              tenantAddress={selectedRow.tenantAddress}
              tenantMapsUrl={selectedRow.tenantMapsUrl}
              loginName={selectedRow.loginName}
              role={selectedRow.role}
              onCancel={() => setActiveModal(null)}
              onSuccess={() => {
                setActiveModal(null);
                setSelectedRow(null);
                router.refresh();
              }}
            />
          ) : null
        }
      />

      <Modal
        isOpen={activeModal === "confirmDelete"}
        onCloseAction={() => setActiveModal(null)}
        icon={<TriangleAlert color="#DC2626" />}
        iconBgOptionalClassName="bg-[#fee2e2]"
        title={`Eliminar tenant ${selectedRow?.tenantName ?? ""}`}
        fixedBody={
          <div className="text-[var(--color-txt-secondary)] py-6 text-center text-sm flex flex-col gap-4 align-middle items-center">
            <p>
              Esta accion eliminara el tenant asociado a este usuario.
              <br />
              No se puede deshacer.
            </p>
          </div>
        }
        buttonAName="Cancelar"
        buttonAOptionalClassName="bg-[var(--color-cancel)] text-black"
        onButtonAClickAction={() => setActiveModal(null)}
        buttonBName={isPending ? "Eliminando..." : "Eliminar"}
        buttonBOptionalClassName="bg-[var(--color-delete)] text-white"
        onButtonBClickAction={() => {
          if (selectedRow?.tenantId) onDelete(selectedRow.tenantId);
        }}
      />
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { CirclePlus, Pencil, Search, Trash, TriangleAlert, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import Modal from "@/app/ui/Modals/Modal";
import AddUsers from "@/app/ui/AddUsers";
import EditUsers from "@/app/ui/EditUsers";
import { deleteUserAction } from "@/app/dashboard/usuarios/actions";

type UserTenantRow = {
  userId: string;
  email: string | null;
  role: string | null;
  tenantId: string | null;
  tenantName: string;
  tenantDomain: string | null;
};

export default function UsuariosPage({ initialUsers }: { initialUsers: UserTenantRow[] }) {
  const [search, setSearch] = useState({ term: "" });
  const [rows, setRows] = useState<UserTenantRow[]>(initialUsers);
  const [activeModal, setActiveModal] = useState<null | "addUser" | "confirmDelete" | "editUser">(null);
  const [selectedRow, setSelectedRow] = useState<UserTenantRow | null>(null);
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
        r.email?.toLowerCase().includes(term) ||
        r.tenantName.toLowerCase().includes(term) ||
        (r.tenantDomain ?? "").toLowerCase().includes(term) ||
        r.role?.toLowerCase().includes(term)
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

  return (
    <div className="max-w-auto p-4 flex flex-col">
      <div className="flex flex-col items-start gap-2">
        <h1 className="text-3xl font-bold">Usuarios</h1>
        <p className="text-md text-[var(--color-txt-secondary)]">
          Administra nombre, rol y clave publica de cada tenant.
        </p>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => openModal("addUser")}
          className="p-2 pl-5 pr-5 bg-[var(--color-button-send)] text-white rounded-xl cursor-pointer font-bold disabled:opacity-60 inline-flex items-center justify-center gap-2 transition"
        >
          <CirclePlus /> Anadir nuevo usuario
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
          placeholder="Buscar por email, tenant, clave o rol"
          value={search.term}
          onChange={(e) => setSearch((prev) => ({ ...prev, term: e.target.value }))}
        />
      </div>

      <section className="bg-[var(--color-foreground)] border border-[var(--color-line-limit)] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2">Usuarios del tenant</h2>
        {filteredRows.length === 0 ? (
          <p className="text-sm text-[var(--color-txt-secondary)]">Aun no hay usuarios.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-[var(--color-line-limit)]">
                  <th className="py-2">Email</th>
                  <th className="py-2">Tenant</th>
                  <th className="py-2">Clave publica</th>
                  <th className="py-2">Rol</th>
                  <th className="py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={`${row.userId}-${row.tenantId}`} className="border-b border-[var(--color-line-limit)]">
                    <td className="py-2">{row.email ?? "Sin email"}</td>
                    <td className="py-2">{row.tenantName}</td>
                    <td className="py-2 font-mono text-xs">{row.tenantDomain ?? row.tenantId ?? "Sin clave"}</td>
                    <td className="py-2">{row.role ?? "Sin rol"}</td>
                    <td className="py-2">
                      <div className="flex items-center justify-end gap-2">
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
        title="Anadir usuario"
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

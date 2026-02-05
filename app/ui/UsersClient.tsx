"use client";

import { useEffect, useState, useTransition } from "react";
import { CirclePlus, Search, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { User } from "@/app/lib/validators/types";
import Modal from "@/app/ui/Modals/Modal";
import AddUsers from "@/app/ui/AddUsers";
import { listUsersAction } from "@/app/dashboard/usuarios/actions";

type UserTenantRow = {
  userId: string;
  email: string | null;
  role: string | null;
  tenantId: string | null;
  tenantName: string;
};

export default function UsuariosPage() {
  // ESTADOS PRINCIPALES
  const [search, setSearch] = useState({ term: "" });

  const [rows, setRows] = useState<UserTenantRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<null | "addUser" | "confirmDelete" | "editUser" | "useFilter">(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // MODALES
  function openModal(modalName: "addUser" | "confirmDelete" | "editUser" | "useFilter", user?: User | null) {
    setSelectedUser(user ?? null);
    setActiveModal(modalName);
  }

  useEffect(() => {
    startTransition(async () => {
      try {
        const res = await listUsersAction();
        if (res?.ok) setRows(res.users ?? []);
      } catch (err: any) {
        setLoadError(err?.message || "Error cargando usuarios");
      }
    });
  }, []);

  const filteredRows = rows.filter((r) => {
    const term = search.term.trim().toLowerCase();
    if (!term) return true;
    return (
      r.email?.toLowerCase().includes(term) ||
      r.tenantName.toLowerCase().includes(term) ||
      r.role?.toLowerCase().includes(term)
    );
  });

  // RENDERIZADO
  return (
    <div className="max-w-auto p-4 flex flex-col">
      <div className="flex flex-col items-start gap-2">
        <h1 className="text-3xl font-bold">Usuarios</h1>
        <p className="text-md text-[var(--color-txt-secondary)]">Visualiza los usuarios existentes.</p>
      </div>

      {/* Añadir y buscar */}
      <div className="mt-4">
        {/* Botón añadir */}
        <button
          type="button"
          onClick={() => openModal("addUser")}
          className="p-2 pl-5 pr-5 bg-[var(--color-button-send)] text-white rounded-xl cursor-pointer font-bold disabled:opacity-60 inline-flex items-center justify-center gap-2 transition"
        >
          <CirclePlus /> Añadir nuevo usuario
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
          placeholder="Buscar usuarios por nombre"
          value={search.term}
          onChange={(e) => setSearch((prev) => ({ ...prev, term: e.target.value }))}
        />
      </div>

      <section className="bg-[var(--color-foreground)] border border-[var(--color-line-limit)] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2">Usuarios del tenant</h2>
        {loadError ? (
          <p className="text-sm text-red-500">{loadError}</p>
        ) : filteredRows.length === 0 ? (
          <p className="text-sm text-[var(--color-txt-secondary)]">Aun no hay usuarios.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-[var(--color-line-limit)]">
                  <th className="py-2">Email</th>
                  <th className="py-2">Tenant</th>
                  <th className="py-2">Rol</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={`${row.userId}-${row.tenantId}`} className="border-b border-[var(--color-line-limit)]">
                    <td className="py-2">{row.email ?? "Sin email"}</td>
                    <td className="py-2">{row.tenantName}</td>
                    <td className="py-2">{row.role ?? "Sin rol"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal para añadir usuarios */}
      <Modal
        isOpen={activeModal === "addUser"}
        icon={<Upload color="#137fec" />}
        iconBgOptionalClassName="bg-[var(--color-bg-selected)]"
        onCloseAction={() => setActiveModal(null)}
        title="Añadir Usuario"
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
    </div>
  );
}

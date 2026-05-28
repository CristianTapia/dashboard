"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CirclePlus, Pencil, Save, Trash2, UserRound, Users } from "lucide-react";

import {
  createTenantStaffUserAction,
  deleteTenantStaffUserAction,
  updateTenantStaffAssignmentsAction,
} from "@/app/dashboard/usuarios/actions";
import { TenantTeamRow } from "@/app/lib/data/users";
import { RestaurantTable } from "@/app/lib/validators/types";
import Modal from "@/app/ui/Modals/Modal";

type Role = "tenant_admin" | "staff";
type ActiveModal = null | "addUser" | "editAssignments";

const roleLabels: Record<Role, string> = {
  tenant_admin: "Tenant admin",
  staff: "Garzon",
};

function normalizeRole(role: string | null): Role {
  return role === "tenant_admin" ? "tenant_admin" : "staff";
}

function resolveSalonSelection({
  currentSalons,
  currentTableIds,
  salon,
  salonTableIds,
  tableId,
}: {
  currentSalons: string[];
  currentTableIds: string[];
  salon: string;
  salonTableIds: string[];
  tableId: string;
}) {
  if (currentSalons.includes(salon)) {
    return { salons: currentSalons, tableIds: currentTableIds };
  }

  const nextTableIds = currentTableIds.includes(tableId)
    ? currentTableIds.filter((id) => id !== tableId)
    : [...currentTableIds, tableId];

  const allSalonTablesSelected =
    salonTableIds.length > 0 && salonTableIds.every((salonTableId) => nextTableIds.includes(salonTableId));

  if (!allSalonTablesSelected) {
    return { salons: currentSalons, tableIds: nextTableIds };
  }

  return {
    salons: [...currentSalons, salon],
    tableIds: nextTableIds.filter((selectedTableId) => !salonTableIds.includes(selectedTableId)),
  };
}

export default function TenantTeamClient({
  initialTeam,
  tables,
}: {
  initialTeam: TenantTeamRow[];
  tables: RestaurantTable[];
}) {
  const router = useRouter();
  const [team, setTeam] = useState(initialTeam);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedUser, setSelectedUser] = useState<TenantTeamRow | null>(null);
  const [name, setName] = useState("");
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("staff");
  const [createSalons, setCreateSalons] = useState<string[]>([]);
  const [tableIds, setTableIds] = useState<string[]>([]);
  const [editName, setEditName] = useState("");
  const [editLoginName, setEditLoginName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState<Role>("staff");
  const [editSalons, setEditSalons] = useState<string[]>([]);
  const [editTableIds, setEditTableIds] = useState<string[]>([]);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const tableById = useMemo(() => new Map(tables.map((table) => [table.id, table])), [tables]);
  const tablesBySalon = useMemo(() => {
    const groups = new Map<string, RestaurantTable[]>();

    for (const table of tables) {
      const salon = table.salon?.trim() || "Salon 1";
      groups.set(salon, [...(groups.get(salon) ?? []), table]);
    }

    return Array.from(groups.entries())
      .map(([salon, salonTables]) => ({
        salon,
        tables: salonTables.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true })),
      }))
      .sort((a, b) => a.salon.localeCompare(b.salon, undefined, { numeric: true }));
  }, [tables]);

  function resetCreateForm() {
    setName("");
    setLoginName("");
    setPassword("");
    setRole("staff");
    setCreateSalons([]);
    setTableIds([]);
  }

  function closeModal() {
    setActiveModal(null);
    setSelectedUser(null);
  }

  function toggleCreateTable(tableId: string) {
    const table = tableById.get(tableId);
    const salon = table?.salon?.trim() || "Salon 1";
    const salonTableIds = tablesBySalon.find((group) => group.salon === salon)?.tables.map((item) => item.id) ?? [];
    const next = resolveSalonSelection({
      currentSalons: createSalons,
      currentTableIds: tableIds,
      salon,
      salonTableIds,
      tableId,
    });

    setCreateSalons(next.salons);
    setTableIds(next.tableIds);
  }

  function toggleCreateSalon(salon: string, salonTableIds: string[]) {
    setCreateSalons((current) => {
      const selected = current.includes(salon);
      return selected ? current.filter((item) => item !== salon) : [...current, salon];
    });
    setTableIds((current) => current.filter((tableId) => !salonTableIds.includes(tableId)));
  }

  function toggleEditSalon(salon: string) {
    setEditSalons((current) => (current.includes(salon) ? current.filter((item) => item !== salon) : [...current, salon]));
  }

  function toggleEditTable(tableId: string) {
    const table = tableById.get(tableId);
    const salon = table?.salon?.trim() || "Salon 1";
    const salonTableIds = tablesBySalon.find((group) => group.salon === salon)?.tables.map((item) => item.id) ?? [];
    const next = resolveSalonSelection({
      currentSalons: editSalons,
      currentTableIds: editTableIds,
      salon,
      salonTableIds,
      tableId,
    });

    setEditSalons(next.salons);
    setEditTableIds(next.tableIds);
  }

  function toggleEditSalonTables(salon: string, salonTableIds: string[]) {
    toggleEditSalon(salon);
    setEditTableIds((current) => current.filter((tableId) => !salonTableIds.includes(tableId)));
  }

  function openEditModal(user: TenantTeamRow) {
    setSelectedUser(user);
    setEditName(user.name ?? "");
    setEditLoginName(user.loginName ?? "");
    setEditPassword("");
    setEditRole(normalizeRole(user.role));
    setEditSalons(user.salons);
    setEditTableIds(user.tableIds);
    setActiveModal("editAssignments");
  }

  function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      try {
        const res = await createTenantStaffUserAction({
          name: name.trim(),
          loginName: loginName.trim(),
          password,
          role,
          salons: createSalons,
          tableIds,
        });
        if (res?.created) {
          setTeam((current) => [res.created, ...current]);
        }
        resetCreateForm();
        setActiveModal(null);
        router.refresh();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Error creando usuario";
        alert(message);
      }
    });
  }

  function onSaveAssignments() {
    if (!selectedUser) return;

    setPendingUserId(selectedUser.userId);
    startTransition(async () => {
      try {
        await updateTenantStaffAssignmentsAction(selectedUser.userId, {
          name: editName.trim(),
          loginName: editLoginName.trim(),
          password: editPassword.trim() || undefined,
          role: editRole,
          salons: editSalons,
          tableIds: editTableIds,
        });
        setTeam((current) =>
          current.map((user) =>
            user.userId === selectedUser.userId
              ? {
                  ...user,
                  name: editName.trim(),
                  loginName: editLoginName.trim(),
                  role: editRole,
                  salons: editSalons,
                  tableIds: editTableIds,
                }
              : user,
          ),
        );
        closeModal();
        router.refresh();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Error guardando asignaciones";
        alert(message);
      } finally {
        setPendingUserId(null);
      }
    });
  }

  function onDeleteStaffUser(user: TenantTeamRow) {
    if (normalizeRole(user.role) !== "staff") return;
    const confirmed = window.confirm(`Eliminar al garzon ${user.name ?? user.loginName ?? "seleccionado"}?`);
    if (!confirmed) return;

    setPendingUserId(user.userId);
    startTransition(async () => {
      try {
        await deleteTenantStaffUserAction(user.userId);
        setTeam((current) => current.filter((item) => item.userId !== user.userId));
        router.refresh();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Error eliminando garzon";
        alert(message);
      } finally {
        setPendingUserId(null);
      }
    });
  }

  function formatTable(tableId: string) {
    const table = tableById.get(tableId);
    if (!table) return "Mesa no encontrada";
    return `${table.salon ?? "Salon 1"} - ${table.label}`;
  }

  function renderTablePicker({
    selectedSalons,
    selectedTableIds,
    onToggleTable,
    onToggleSalon,
  }: {
    selectedSalons: string[];
    selectedTableIds: string[];
    onToggleTable: (tableId: string) => void;
    onToggleSalon: (salon: string, tableIds: string[]) => void;
  }) {
    return (
      <div className="space-y-3 pr-1 sm:max-h-[50dvh] sm:overflow-y-auto">
        {tablesBySalon.map((group) => {
          const salonTableIds = group.tables.map((table) => table.id);
          const salonSelected = selectedSalons.includes(group.salon);
          const allTablesSelected =
            salonTableIds.length > 0 && salonTableIds.every((tableId) => selectedTableIds.includes(tableId));

          return (
            <section key={group.salon} className="rounded-xl border border-[var(--color-border-box)] p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{group.salon}</p>
                  <p className="text-xs text-[var(--color-txt-secondary)]">{group.tables.length} mesas</p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleSalon(group.salon, salonTableIds)}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                    salonSelected
                      ? "border-[var(--color-button-send)] bg-[var(--color-bg-selected)] text-[var(--color-txt-selected)]"
                      : "border-[var(--color-border-box)]"
                  }`}
                >
                  {salonSelected ? "Salon asignado" : allTablesSelected ? "Mesas asignadas" : "Asignar salon"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {group.tables.map((table) => (
                  <button
                    key={table.id}
                    type="button"
                    disabled={salonSelected}
                    onClick={() => onToggleTable(table.id)}
                    className={`min-h-9 rounded-lg border px-3 py-2 text-xs ${
                      salonSelected || selectedTableIds.includes(table.id)
                        ? "border-[var(--color-button-send)] bg-[var(--color-bg-selected)] text-[var(--color-txt-selected)]"
                        : "border-[var(--color-border-box)]"
                    } ${salonSelected ? "cursor-not-allowed opacity-80" : ""}`}
                  >
                    {table.label}
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-full flex-col p-2 sm:p-4">
      <div className="flex flex-col items-start gap-1.5">
        <h1 className="text-2xl font-semibold sm:text-[1.7rem]">Equipo</h1>
        <p className="max-w-2xl text-sm leading-6 text-[var(--color-txt-secondary)]">
          Crea garzones y asigna mesas para que vean solo la atencion que les corresponde.
        </p>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => setActiveModal("addUser")}
          className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--color-border-box)] bg-[var(--color-bg-selected)] px-4 text-sm font-medium text-[var(--color-txt-selected)] transition hover:border-[var(--color-button-send)] hover:bg-[var(--color-bg-selected)] disabled:opacity-60 sm:w-auto"
        >
          <CirclePlus size={18} /> Añadir usuario
        </button>
      </div>

      {team.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[var(--color-border-box)] p-8 text-center text-sm text-[var(--color-txt-secondary)]">
          Aun no hay usuarios operativos.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4 sm:gap-6">
          {team.map((user) => {
            const userRole = normalizeRole(user.role);

            return (
              <article
                key={user.userId}
                className="dark:bg-surface-dark flex min-w-0 flex-col overflow-hidden rounded-xl bg-[var(--color-foreground)] shadow-card"
              >
                <div className="flex flex-grow flex-col p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2 pr-2">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-bg-selected)] text-[var(--color-button-send)]">
                        <UserRound size={18} />
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold">{user.name ?? user.loginName ?? "Usuario"}</h3>
                        <p className="truncate text-xs text-[var(--color-txt-secondary)]">
                          {user.loginName ? `Usuario: ${user.loginName}` : roleLabels[userRole]}
                        </p>
                        {user.loginName ? (
                          <p className="truncate text-xs text-[var(--color-txt-secondary)]">{roleLabels[userRole]}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex-grow space-y-3">
                    <div className="rounded-lg bg-[var(--color-bg-selected)] p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-txt-secondary)]">
                        Salones asignados
                      </p>
                      {user.salons.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {user.salons.map((salon) => (
                            <span key={salon} className="rounded-lg bg-[var(--color-foreground)] px-2.5 py-1 text-xs">
                              {salon}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-1 text-sm text-[var(--color-txt-secondary)]">Sin salones completos asignados.</p>
                      )}
                    </div>

                    <div className="rounded-lg bg-[var(--color-bg-selected)] p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-txt-secondary)]">
                        Mesas especificas
                      </p>
                      {user.tableIds.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {user.tableIds.map((tableId) => (
                            <span key={tableId} className="rounded-lg bg-[var(--color-foreground)] px-2.5 py-1 text-xs">
                              {formatTable(tableId)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-1 text-sm text-[var(--color-txt-secondary)]">Sin mesas especificas.</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-1.5 border-t border-[var(--color-border-box)] pt-4 dark:border-border-dark">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => openEditModal(user)}
                      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-[var(--color-light)] transition-colors hover:bg-[var(--color-cancel)] hover:text-[var(--color-light-hover)] disabled:opacity-60"
                      title="Editar asignaciones"
                    >
                      <Pencil size={17} />
                    </button>
                    {userRole === "staff" ? (
                      <button
                        type="button"
                        disabled={pendingUserId === user.userId}
                        onClick={() => onDeleteStaffUser(user)}
                        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-[var(--color-delete)] transition-colors hover:bg-red-50 hover:text-[var(--color-delete-hover)] disabled:opacity-60 dark:hover:bg-red-900/20"
                        title="Eliminar garzon"
                      >
                        <Trash2 size={17} />
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={activeModal === "addUser"}
        icon={<Users color="#137fec" />}
        iconBgOptionalClassName="bg-[var(--color-bg-selected)]"
        onCloseAction={closeModal}
        title="Añadir usuario"
        fixedBody={
          <form onSubmit={onCreate} className="grid grid-cols-1 gap-3 py-2 lg:grid-cols-2">
            <input
              className="rounded-lg border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-3 text-sm"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className="rounded-lg border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-3 text-sm"
              placeholder="Nombre de usuario"
              value={loginName}
              onChange={(e) => setLoginName(e.target.value.toLowerCase())}
              required
            />
            <input
              className="rounded-lg border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-3 text-sm lg:col-span-2"
              placeholder="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <select
              className="rounded-lg border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-3 text-sm lg:col-span-2"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="staff">Garzon</option>
              <option value="tenant_admin">Tenant admin</option>
            </select>
            <div className="lg:col-span-2">
              <p className="mb-2 text-xs font-semibold text-[var(--color-txt-secondary)]">Mesas por salon</p>
              {renderTablePicker({
                selectedSalons: createSalons,
                selectedTableIds: tableIds,
                onToggleTable: toggleCreateTable,
                onToggleSalon: toggleCreateSalon,
              })}
            </div>
            <div className="grid grid-cols-1 gap-3 border-t border-[var(--color-border-box)] pt-4 sm:grid-cols-2 lg:col-span-2">
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-lg bg-[var(--color-cancel)] px-4 text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending}
                className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[var(--color-button-send)] px-4 text-sm font-semibold text-white disabled:opacity-60"
              >
                <CirclePlus size={16} />
                {pending ? "Creando..." : "Crear usuario"}
              </button>
            </div>
          </form>
        }
      />

      <Modal
        isOpen={activeModal === "editAssignments"}
        icon={<Pencil color="#137fec" />}
        iconBgOptionalClassName="bg-[var(--color-bg-selected)]"
        onCloseAction={closeModal}
        title={`Editar ${selectedUser?.name ?? selectedUser?.loginName ?? "usuario"}`}
        fixedBody={
          selectedUser ? (
            <div className="grid grid-cols-1 gap-4 py-2">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <input
                  className="rounded-lg border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-3 text-sm"
                  placeholder="Nombre de la persona"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
                <input
                  className="rounded-lg border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-3 text-sm"
                  placeholder="Nombre de usuario"
                  value={editLoginName}
                  onChange={(e) => setEditLoginName(e.target.value.toLowerCase())}
                  required
                />
                <input
                  className="rounded-lg border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-3 text-sm lg:col-span-2"
                  placeholder="Nueva contraseña (opcional)"
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                />
              </div>
              <select
                className="rounded-lg border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-3 text-sm"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as Role)}
              >
                <option value="tenant_admin">Tenant admin</option>
                <option value="staff">Garzon</option>
              </select>

              <div>
                <p className="mb-2 text-xs font-semibold text-[var(--color-txt-secondary)]">Mesas por salon</p>
                {renderTablePicker({
                  selectedSalons: editSalons,
                  selectedTableIds: editTableIds,
                  onToggleTable: toggleEditTable,
                  onToggleSalon: toggleEditSalonTables,
                })}
              </div>

              <div className="grid grid-cols-1 gap-3 border-t border-[var(--color-border-box)] pt-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-lg bg-[var(--color-cancel)] px-4 text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={pendingUserId === selectedUser.userId}
                  onClick={onSaveAssignments}
                  className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[var(--color-button-send)] px-4 text-sm font-semibold text-white disabled:opacity-60"
                >
                  <Save size={16} />
                  {pendingUserId === selectedUser.userId ? "Guardando..." : "Guardar asignaciones"}
                </button>
              </div>
            </div>
          ) : null
        }
      />

    </div>
  );
}

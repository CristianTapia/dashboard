"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Link2 } from "lucide-react";

import { closeJoinedTableSessionAction, createJoinedTableSessionAction } from "@/app/dashboard/unir-mesas/actions";
import type { ActiveJoinedTableSession, JoinableRestaurantTable } from "@/app/lib/data/table-sessions";

export default function JoinTablesClient({
  tables,
  activeSessions,
}: {
  tables: JoinableRestaurantTable[];
  activeSessions: ActiveJoinedTableSession[];
}) {
  const router = useRouter();
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);
  const [pendingSessionIds, setPendingSessionIds] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const groupedTables = useMemo(() => {
    const groups = new Map<string, JoinableRestaurantTable[]>();

    for (const table of tables) {
      groups.set(table.salon, [...(groups.get(table.salon) ?? []), table]);
    }

    return Array.from(groups.entries())
      .map(([salon, salonTables]) => ({
        salon,
        tables: salonTables.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true })),
      }))
      .sort((a, b) => a.salon.localeCompare(b.salon, undefined, { numeric: true }));
  }, [tables]);

  function toggleTable(tableId: string) {
    setErrorMessage(null);
    setSuccessMessage(null);
    setSelectedTableIds((current) =>
      current.includes(tableId) ? current.filter((id) => id !== tableId) : [...current, tableId],
    );
  }

  function onSubmit() {
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const result = await createJoinedTableSessionAction(selectedTableIds);
        setSelectedTableIds([]);
        setSuccessMessage(`Mesas unidas correctamente. Sesion ${result.session.id}`);
        router.refresh();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "No se pudieron unir las mesas";
        setErrorMessage(message);
      }
    });
  }

  function onCloseSession(sessionId: string) {
    setErrorMessage(null);
    setSuccessMessage(null);
    setPendingSessionIds((current) => ({ ...current, [sessionId]: true }));

    startTransition(async () => {
      try {
        await closeJoinedTableSessionAction(sessionId);
        setSuccessMessage("Mesas desunidas correctamente. Cada mesa conserva su QR unico.");
        router.refresh();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "No se pudieron desunir las mesas";
        setErrorMessage(message);
      } finally {
        setPendingSessionIds((current) => {
          const next = { ...current };
          delete next[sessionId];
          return next;
        });
      }
    });
  }

  return (
    <div className="flex w-full max-w-full flex-col p-2 sm:p-4">
      <div className="flex flex-col items-start gap-1.5">
        <h1 className="text-2xl font-semibold sm:text-[1.7rem]">Unir mesas</h1>
        <p className="max-w-2xl text-sm leading-6 text-[var(--color-txt-secondary)]">
          Administra mesas unidas y separalas cuando vuelvan a operar con su QR propio.
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-lg border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-[var(--color-txt-secondary)]">
          {selectedTableIds.length} {selectedTableIds.length === 1 ? "mesa seleccionada" : "mesas seleccionadas"}
        </div>
        <button
          type="button"
          disabled={selectedTableIds.length < 2 || isPending}
          onClick={onSubmit}
          className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--color-border-box)] bg-[var(--color-bg-selected)] px-4 text-sm font-medium text-[var(--color-txt-selected)] transition hover:border-[var(--color-button-send)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <Link2 size={18} />
          {isPending ? "Uniendo..." : "Unir mesas"}
        </button>
      </div>

      {errorMessage ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMessage}</div>
      ) : null}

      {successMessage ? (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {successMessage}
        </div>
      ) : null}

      <section className="mt-6 rounded-xl border border-[var(--color-border-box)] p-3 sm:p-4">
        <div className="mb-3">
          <h2 className="text-base font-semibold">Mesas unidas actualmente</h2>
          <p className="text-xs text-[var(--color-txt-secondary)]">
            {activeSessions.length} {activeSessions.length === 1 ? "sesion activa" : "sesiones activas"}
          </p>
        </div>

        {activeSessions.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {activeSessions.map((session) => {
              const pending = Boolean(pendingSessionIds[session.id]);
              const labels = session.tables.map((table) => table.label);

              return (
                <article
                  key={session.id}
                  className="rounded-lg border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        {labels.length > 0 ? labels.join(" + ") : "Sesion de mesas"}
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-txt-secondary)]">
                        Desde {formatTimeLabel(session.opened_at)} - {session.tables.length}{" "}
                        {session.tables.length === 1 ? "mesa" : "mesas"}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {session.tables.map((table) => (
                          <span
                            key={table.id}
                            className="rounded-md bg-[var(--color-bg-selected)] px-2 py-1 text-xs text-[var(--color-txt-secondary)]"
                          >
                            {table.salon} - {table.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={pending || isPending}
                      onClick={() => onCloseSession(session.id)}
                      className="inline-flex h-10 w-full shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[var(--color-border-box)] bg-[var(--color-foreground)] px-4 text-sm font-medium text-[var(--color-delete)] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      {pending ? "Desuniendo..." : "Desunir"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--color-border-box)] p-6 text-center text-sm text-[var(--color-txt-secondary)]">
            No hay mesas unidas activas.
          </div>
        )}
      </section>

      <div className="mt-6 space-y-6">
        {groupedTables.map((group) => (
          <section key={group.salon} className="rounded-xl border border-[var(--color-border-box)] p-3 sm:p-4">
            <div className="mb-3">
              <h2 className="text-base font-semibold">{group.salon}</h2>
              <p className="text-xs text-[var(--color-txt-secondary)]">
                {group.tables.length} {group.tables.length === 1 ? "mesa disponible" : "mesas disponibles"}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.tables.map((table) => {
                const selected = selectedTableIds.includes(table.id);

                return (
                  <button
                    key={table.id}
                    type="button"
                    onClick={() => toggleTable(table.id)}
                    className={`flex min-w-0 cursor-pointer items-center justify-between gap-3 rounded-lg border p-4 text-left transition ${
                      selected
                        ? "border-[var(--color-button-send)] bg-[var(--color-bg-selected)]"
                        : "border-[var(--color-border-box)] bg-[var(--color-foreground)] hover:border-[var(--color-button-send)]"
                    }`}
                    aria-pressed={selected}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{table.label}</span>
                      {table.number ? (
                        <span className="block text-xs text-[var(--color-txt-secondary)]">Mesa {table.number}</span>
                      ) : null}
                    </span>
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                        selected
                          ? "border-[var(--color-button-send)] bg-[var(--color-button-send)]"
                          : "border-[var(--color-border-box)]"
                      }`}
                      aria-hidden="true"
                    >
                      {selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {tables.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[var(--color-border-box)] p-10 text-center text-sm text-[var(--color-txt-secondary)]">
          No hay mesas disponibles para unir.
        </div>
      ) : null}
    </div>
  );
}

function formatTimeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "hora desconocida";

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

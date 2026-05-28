"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BellRing, CheckCircle2, ClipboardList, ConciergeBell, QrCode, ReceiptText, Search, Volume2, VolumeX } from "lucide-react";

import { AttentionSalonGroup, AttentionTableCard, RecentlyHandledAttention } from "@/app/lib/data/attention";
import { supabaseClient } from "@/app/lib/supabase/client";
import TableQrCode from "@/app/ui/TableQrCode";

const ALERT_EVENT_TYPES = new Set([
  "service",
  "waiter",
  "call_waiter",
  "call_server",
  "waiter_call",
  "service_request",
  "bill",
  "account",
  "check",
  "request_bill",
  "bill_request",
  "order",
  "order_request",
  "place_order",
  "command_order",
]);

export default function AttentionClient({
  salonGroups,
  tenantId,
  recentlyHandled,
}: {
  salonGroups: AttentionSalonGroup[];
  tenantId: string;
  recentlyHandled: RecentlyHandledAttention[];
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [recentItems, setRecentItems] = useState(recentlyHandled);
  const [handledTableIds, setHandledTableIds] = useState<Record<string, number>>({});
  const [pendingTableIds, setPendingTableIds] = useState<Record<string, boolean>>({});
  const [reopeningTableIds, setReopeningTableIds] = useState<Record<string, boolean>>({});
  const [expandedQrTableId, setExpandedQrTableId] = useState<string | null>(null);
  const [undoNotice, setUndoNotice] = useState<{ tableId: string; label: string } | null>(null);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [, startRefreshTransition] = useTransition();
  const refreshTimerRef = useRef<number | null>(null);
  const realtimeConnectedRef = useRef(false);
  const locallyHandledTableIdsRef = useRef<Record<string, number>>({});
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastAlertAtRef = useRef(0);
  const notifyNewAlertRef = useRef<(eventType: string) => void>(() => undefined);

  const refreshAttention = useCallback(() => {
    if (refreshTimerRef.current !== null) return;

    refreshTimerRef.current = window.setTimeout(() => {
      refreshTimerRef.current = null;
      startRefreshTransition(() => {
        router.refresh();
      });
    }, 100);
  }, [router, startRefreshTransition]);

  useEffect(() => {
    setRecentItems(recentlyHandled);
  }, [recentlyHandled]);

  useEffect(() => {
    notifyNewAlertRef.current = notifyNewAlert;
  });

  useEffect(() => {
    const channel = supabaseClient
      .channel(`tenant-attention:${tenantId}`)
      .on("broadcast", { event: "table_attention_updated" }, (event) => {
        if (event.payload?.tenantId === tenantId) {
          const tableId = typeof event.payload?.tableId === "string" ? event.payload.tableId : null;
          const action = typeof event.payload?.action === "string" ? event.payload.action : null;
          const eventType = typeof event.payload?.eventType === "string" ? event.payload.eventType : null;
          const ignoreUntil = tableId ? locallyHandledTableIdsRef.current[tableId] ?? 0 : 0;

          if (action === "handled" && ignoreUntil > Date.now()) {
            return;
          }

          if (action === "created" && eventType && ALERT_EVENT_TYPES.has(eventType)) {
            notifyNewAlertRef.current(eventType);
          }

          refreshAttention();
        }
      })
      .subscribe((status) => {
        realtimeConnectedRef.current = status === "SUBSCRIBED";
      });

    return () => {
      realtimeConnectedRef.current = false;
      supabaseClient.removeChannel(channel);
    };
  }, [refreshAttention, tenantId]);

  useEffect(() => {
    const pollingInterval = window.setInterval(() => {
      if (document.visibilityState === "visible" && !realtimeConnectedRef.current) {
        refreshAttention();
      }
    }, 15_000);

    function onVisibilityChange() {
      if (document.visibilityState === "visible" && !realtimeConnectedRef.current) {
        refreshAttention();
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(pollingInterval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
      }
    };
  }, [refreshAttention]);

  const tableNeedsAttention = useCallback(
    (table: AttentionTableCard) => {
      if (table.pendingCount === 0) return false;

      const handledAt = handledTableIds[table.tableId] ?? 0;
      const latestRequestedAt = table.latestRequestedAt ? Date.parse(table.latestRequestedAt) : 0;

      return latestRequestedAt > handledAt;
    },
    [handledTableIds],
  );

  const { urgentTables, filteredGroups } = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const urgent: AttentionTableCard[] = [];

    const groups = salonGroups
      .map((group) => {
        const tables = group.tables
          .filter((table) => {
            if (!term) return true;
            return (
              table.label.toLowerCase().includes(term) ||
              table.salon.toLowerCase().includes(term) ||
              table.tableToken.toLowerCase().includes(term)
            );
          })
          .filter((table) => {
            const needsAttention = tableNeedsAttention(table);
            if (needsAttention) urgent.push(table);
            return !needsAttention;
          })
          .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));

        return {
          ...group,
          tables,
        };
      })
      .filter((group) => group.tables.length > 0)
      .sort((a, b) => a.salon.localeCompare(b.salon, undefined, { numeric: true }));

    urgent.sort((a, b) => {
      const aTime = a.latestRequestedAt ? Date.parse(a.latestRequestedAt) : 0;
      const bTime = b.latestRequestedAt ? Date.parse(b.latestRequestedAt) : 0;
      if (aTime !== bTime) return bTime - aTime;
      return a.label.localeCompare(b.label, undefined, { numeric: true });
    });

    return { urgentTables: urgent, filteredGroups: groups };
  }, [salonGroups, searchTerm, tableNeedsAttention]);

  const pendingCount = salonGroups.reduce(
    (total, group) =>
      total +
      group.tables.filter((table) => {
        return tableNeedsAttention(table);
      }).length,
    0,
  );

  async function enableAlerts() {
    const audioContext = getAudioContext();
    if (audioContext?.state === "suspended") {
      await audioContext.resume().catch(() => undefined);
    }

    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission().catch(() => undefined);
    }

    setAlertsEnabled(true);
    playAlertTone();
    vibrateAlert([80]);
  }

  function disableAlerts() {
    setAlertsEnabled(false);
  }

  function notifyNewAlert(eventType: string) {
    if (!alertsEnabled) return;

    const now = Date.now();
    if (now - lastAlertAtRef.current < 900) return;
    lastAlertAtRef.current = now;

    playAlertTone();
    vibrateAlert([220, 90, 220]);

    if ("Notification" in window && Notification.permission === "granted" && document.visibilityState !== "visible") {
      const notification = new Notification("Nueva alerta de mesa", {
        body: getAlertNotificationText(eventType),
        tag: "table-attention",
      });

      window.setTimeout(() => notification.close(), 8000);
    }
  }

  function getAudioContext() {
    if (audioContextRef.current) return audioContextRef.current;

    const AudioContextConstructor =
      window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return null;

    audioContextRef.current = new AudioContextConstructor();
    return audioContextRef.current;
  }

  function playAlertTone() {
    const audioContext = getAudioContext();
    if (!audioContext || audioContext.state === "closed") return;

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const startsAt = audioContext.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, startsAt);
    oscillator.frequency.setValueAtTime(1040, startsAt + 0.18);
    gain.gain.setValueAtTime(0.0001, startsAt);
    gain.gain.exponentialRampToValueAtTime(0.18, startsAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startsAt + 0.42);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(startsAt);
    oscillator.stop(startsAt + 0.45);
  }

  function vibrateAlert(pattern: VibratePattern) {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  }

  function onMarkHandled(tableId: string) {
    const tableLabel =
      salonGroups.flatMap((group) => group.tables).find((table) => table.tableId === tableId)?.label ?? "Mesa";

    setHandledTableIds((prev) => ({ ...prev, [tableId]: Date.now() }));
    setPendingTableIds((prev) => ({ ...prev, [tableId]: true }));
    setUndoNotice({ tableId, label: tableLabel });
    locallyHandledTableIdsRef.current[tableId] = Date.now() + 10_000;

    window.setTimeout(() => {
      setUndoNotice((current) => (current?.tableId === tableId ? null : current));
    }, 12_000);

    void (async () => {
      try {
        const response = await fetch(`/api/dashboard/attention/tables/${encodeURIComponent(tableId)}/handled`, {
          method: "POST",
          keepalive: true,
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(body?.error ?? "Error marcando la mesa como atendida");
        }
      } catch (error: unknown) {
        delete locallyHandledTableIdsRef.current[tableId];
        setUndoNotice((current) => (current?.tableId === tableId ? null : current));
        setHandledTableIds((prev) => {
          const next = { ...prev };
          delete next[tableId];
          return next;
        });
        const message = error instanceof Error ? error.message : "Error marcando la mesa como atendida";
        alert(message);
      } finally {
        setPendingTableIds((prev) => {
          const next = { ...prev };
          delete next[tableId];
          return next;
        });
      }
    })();
  }

  function onUndoHandled(tableId: string) {
    setUndoNotice(null);
    setPendingTableIds((prev) => ({ ...prev, [tableId]: true }));
    const previousHandledAt = handledTableIds[tableId] ?? Date.now();

    delete locallyHandledTableIdsRef.current[tableId];
    setHandledTableIds((prev) => {
      const next = { ...prev };
      delete next[tableId];
      return next;
    });

    void (async () => {
      try {
        const response = await fetch(`/api/dashboard/attention/tables/${encodeURIComponent(tableId)}/reopen`, {
          method: "POST",
          keepalive: true,
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(body?.error ?? "Error reabriendo la mesa");
        }

        refreshAttention();
      } catch (error: unknown) {
        setHandledTableIds((prev) => ({ ...prev, [tableId]: previousHandledAt }));
        locallyHandledTableIdsRef.current[tableId] = Date.now() + 10_000;
        const message = error instanceof Error ? error.message : "Error reabriendo la mesa";
        alert(message);
      } finally {
        setPendingTableIds((prev) => {
          const next = { ...prev };
          delete next[tableId];
          return next;
        });
      }
    })();
  }

  function onReopenRecent(tableId: string) {
    const previousItems = recentItems;

    setRecentItems((current) => current.filter((item) => item.tableId !== tableId));
    setReopeningTableIds((prev) => ({ ...prev, [tableId]: true }));
    delete locallyHandledTableIdsRef.current[tableId];
    setHandledTableIds((prev) => {
      const next = { ...prev };
      delete next[tableId];
      return next;
    });

    void (async () => {
      try {
        const response = await fetch(`/api/dashboard/attention/tables/${encodeURIComponent(tableId)}/reopen`, {
          method: "POST",
          keepalive: true,
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(body?.error ?? "Error reabriendo la mesa");
        }

        refreshAttention();
      } catch (error: unknown) {
        setRecentItems(previousItems);
        const message = error instanceof Error ? error.message : "Error reabriendo la mesa";
        alert(message);
      } finally {
        setReopeningTableIds((prev) => {
          const next = { ...prev };
          delete next[tableId];
          return next;
        });
      }
    })();
  }

  function renderTableCard(table: AttentionTableCard) {
    const needsAttention = tableNeedsAttention(table);
    const requestedAtLabel = table.latestRequestedAt ? formatTimeLabel(table.latestRequestedAt) : null;
    const requests = [
      {
        active: needsAttention && table.serviceRequested,
        icon: <ConciergeBell size={16} />,
        label: "Servicio",
        description: "El cliente llama al garzon",
      },
      {
        active: needsAttention && table.billRequested,
        icon: <ReceiptText size={16} />,
        label: "Cuenta",
        description: "El cliente pide pagar",
      },
      {
        active: needsAttention && table.orderRequested,
        icon: <ClipboardList size={16} />,
        label: "Pedido",
        description: "El cliente quiere ordenar",
      },
    ];
    const activeRequests = requests.filter((request) => request.active);

    return (
      <article
        key={table.tableId}
        className={`group relative flex min-w-0 flex-col overflow-hidden rounded-xl border bg-[var(--color-foreground)] p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card sm:p-4 ${
          needsAttention
            ? "border-[var(--color-button-send)] shadow-card ring-2 ring-sky-400/10"
            : "border-[var(--color-border-box)]"
        }`}
      >
        {needsAttention ? <div className="absolute inset-x-0 top-0 h-1 bg-[var(--color-button-send)]" /> : null}

        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                needsAttention
                  ? "bg-[var(--color-bg-selected)] text-[var(--color-button-send)] shadow-sm ring-1 ring-[var(--color-button-send)]/20"
                  : "bg-[var(--color-bg-selected)] text-[var(--color-button-send)]"
              }`}
            >
              {needsAttention ? <BellRing size={18} /> : <ConciergeBell size={18} />}
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold">{table.label}</h3>
              <p className="truncate text-xs text-[var(--color-txt-secondary)]">{table.salon}</p>
            </div>
          </div>

          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              needsAttention
                ? "bg-[var(--color-bg-selected)] text-[var(--color-txt-selected)] ring-1 ring-[var(--color-button-send)]/25"
                : "bg-[var(--color-bg-selected)] text-[var(--color-txt-secondary)]"
            }`}
          >
            {needsAttention ? <BellRing size={12} /> : <CheckCircle2 size={12} />}
            {needsAttention ? `${table.pendingCount} pendiente${table.pendingCount === 1 ? "" : "s"}` : "Sin alertas"}
          </span>
        </div>

        {needsAttention ? (
          <div className="mt-4 rounded-xl border border-[var(--color-button-send)]/25 bg-[var(--color-bg-selected)] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-txt-secondary)]">
                Cliente solicita
              </p>
              {requestedAtLabel ? (
                <span className="text-xs font-medium text-[var(--color-txt-secondary)]">Recibido {requestedAtLabel}</span>
              ) : null}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {activeRequests.length > 0
                ? activeRequests.map((request) => <RequestActionCard key={request.label} {...request} />)
                : requests.map((request) => <RequestActionCard key={request.label} {...request} active />)}
            </div>
          </div>
        ) : null}

        {needsAttention && table.orderRequested ? (
          <div className="mt-3 rounded-xl border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-3">
            <div className="flex items-start gap-2">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-bg-selected)] text-[var(--color-button-send)]">
                <ClipboardList size={17} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">
                  {table.orderRequests.length > 1
                    ? `${table.orderRequests.length} comandas pendientes`
                    : "Comanda pendiente"}
                </p>
                {table.orderItemSummary.length > 0 ? (
                  <div className="mt-2 rounded-lg border border-[var(--color-border-box)] bg-[var(--color-bg-selected)] px-2.5 py-2">
                    <p className="text-xs font-semibold text-[var(--color-txt-selected)]">Resumen total</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {table.orderItemSummary.map((item) => (
                        <span
                          key={item.name}
                          className="rounded-md bg-[var(--color-foreground)] px-2 py-1 text-xs text-[var(--color-txt-secondary)]"
                        >
                          {item.quantity}x {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                <details className="mt-2 group">
                  <summary className="cursor-pointer rounded-lg border border-[var(--color-border-box)] bg-[var(--color-bg-selected)] px-2.5 py-2 text-xs font-semibold text-[var(--color-txt-selected)] marker:text-[var(--color-txt-secondary)]">
                    Ver detalle de comandas
                  </summary>
                  <div className="mt-2 space-y-2">
                    {(table.orderRequests.length > 0
                      ? table.orderRequests
                      : [{ id: 0, summary: table.orderSummary ?? "Comanda recibida desde el menu", receivedAt: "" }]
                    ).map((order, index) => (
                      <div
                        key={`${table.tableId}-${order.id}-${index}`}
                        className="rounded-lg border border-[var(--color-border-box)] bg-[var(--color-bg-selected)] px-2.5 py-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-[var(--color-txt-selected)]">Comanda {index + 1}</span>
                          {order.receivedAt ? (
                            <span className="text-[11px] text-[var(--color-txt-secondary)]">{formatTimeLabel(order.receivedAt)}</span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs leading-5 text-[var(--color-txt-secondary)]">{order.summary}</p>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-auto pt-3">
          <button
            type="button"
            onClick={() => setExpandedQrTableId((current) => (current === table.tableId ? null : table.tableId))}
            className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--color-border-box)] bg-[var(--color-bg-selected)] px-3 text-sm font-medium text-[var(--color-txt-selected)] transition hover:border-[var(--color-button-send)]"
          >
            <QrCode size={15} />
            {expandedQrTableId === table.tableId ? "Ocultar codigo QR" : "Mostrar codigo QR"}
          </button>
        </div>

        {expandedQrTableId === table.tableId ? (
          <div className="mt-3">
            <TableQrCode value={table.publicUrl} label={table.label} number={table.number} name={table.name} />
          </div>
        ) : null}

        <button
          type="button"
          disabled={!needsAttention || Boolean(pendingTableIds[table.tableId])}
          onClick={() => onMarkHandled(table.tableId)}
          className={`mt-3 inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition disabled:cursor-not-allowed ${
            needsAttention
              ? "border border-[var(--color-button-send)] bg-[var(--color-button-send)] text-white shadow-sm hover:bg-[var(--color-button-send-hover)] disabled:opacity-60"
              : "border border-[var(--color-border-box)] bg-[var(--color-bg-selected)] text-[var(--color-txt-secondary)]"
          }`}
        >
          <CheckCircle2 size={16} />
          {pendingTableIds[table.tableId] ? "Guardando..." : needsAttention ? "Marcar como atendida" : "Mesa atendida"}
        </button>
      </article>
    );
  }

  return (
    <div className="flex w-full max-w-full flex-col p-1.5 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col items-start gap-1.5">
          <h1 className="text-xl font-semibold sm:text-[1.7rem]">Atencion</h1>
          <p className="max-w-2xl text-xs leading-5 text-[var(--color-txt-secondary)] sm:text-sm sm:leading-6">
            Solicitudes de servicio, cuenta y pedido enviadas desde el menu por cada mesa.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border-box)] bg-[var(--color-foreground)] px-3 py-2 text-sm shadow-sm">
            <BellRing size={16} className={pendingCount > 0 ? "text-[var(--color-delete)]" : "text-[var(--color-txt-secondary)]"} />
            <span className="font-medium">{pendingCount}</span>
            <span className="text-[var(--color-txt-secondary)]">pendientes</span>
          </div>
          <button
            type="button"
            onClick={alertsEnabled ? disableAlerts : enableAlerts}
            className={`inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium shadow-sm transition ${
              alertsEnabled
                ? "border-[var(--color-button-send)] bg-[var(--color-bg-selected)] text-[var(--color-txt-selected)]"
                : "border-[var(--color-border-box)] bg-[var(--color-foreground)] text-[var(--color-txt-secondary)] hover:border-[var(--color-button-send)]"
            }`}
          >
            {alertsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {alertsEnabled ? "Alertas activas" : "Activar alertas"}
          </button>
        </div>
      </div>

      <div className="mb-6 mt-6 flex w-full">
        <div className="flex items-center justify-center rounded-l-lg border border-r-0 border-[var(--color-border-box)] bg-[var(--color-foreground)] p-2 text-slate-500">
          <Search />
        </div>
        <input
          type="text"
          name="search"
          className="w-full min-w-0 rounded-r-lg border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-3 focus:border-[var(--color-button-send)] focus:outline-none focus:ring-0"
          placeholder="Buscar por salon, mesa o token"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {urgentTables.length > 0 ? (
        <section className="mb-5 rounded-xl border border-[var(--color-button-send)]/30 bg-[var(--color-foreground)] p-2.5 ring-2 ring-sky-400/10 sm:mb-6 sm:p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold">Atenciones pendientes</h2>
              <p className="text-xs text-[var(--color-txt-secondary)]">
                Mesas ordenadas por solicitud mas reciente
              </p>
            </div>
          </div>
          <div className="max-h-[min(65dvh,42rem)] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(230px,360px))] sm:justify-center sm:gap-4">
              {urgentTables.map((table) => renderTableCard(table))}
            </div>
          </div>
        </section>
      ) : null}

      {recentItems.length > 0 ? (
        <details className="mb-5 rounded-xl border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-3 shadow-sm sm:mb-6 sm:p-4">
          <summary className="cursor-pointer select-none text-sm font-semibold text-[var(--color-txt-selected)]">
            Atendidas recientemente ({recentItems.length})
          </summary>
          <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-2">
            {recentItems.map((item) => (
              <div
                key={`${item.tableId}-${item.handledAt}`}
                className="flex min-w-0 flex-col gap-3 rounded-lg border border-[var(--color-border-box)] bg-[var(--color-bg-selected)] p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{item.label}</p>
                  <p className="truncate text-xs text-[var(--color-txt-secondary)]">
                    {item.salon} · {formatTimeLabel(item.handledAt)} · {item.pendingCount}{" "}
                    {item.pendingCount === 1 ? "evento" : "eventos"}
                  </p>
                  <p className="mt-1 truncate text-xs text-[var(--color-txt-secondary)]">{item.summary}</p>
                </div>
                <button
                  type="button"
                  disabled={Boolean(reopeningTableIds[item.tableId])}
                  onClick={() => onReopenRecent(item.tableId)}
                  className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[var(--color-button-send)] bg-[var(--color-foreground)] px-3 text-xs font-semibold text-[var(--color-txt-selected)] transition hover:bg-[var(--color-bg-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {reopeningTableIds[item.tableId] ? "Reabriendo..." : "Reabrir"}
                </button>
              </div>
            ))}
          </div>
        </details>
      ) : null}

      <div className="space-y-4 sm:space-y-6">
        {filteredGroups.map((group) => (
          <section key={group.salon} className="rounded-xl border border-[var(--color-border-box)] p-2.5 sm:p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold">{group.salon}</h2>
                <p className="text-xs text-[var(--color-txt-secondary)]">
                  {group.tables.length} {group.tables.length === 1 ? "mesa" : "mesas"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(230px,360px))] sm:justify-center sm:gap-4">
              {group.tables.map((table) => renderTableCard(table))}
            </div>
          </section>
        ))}
      </div>

      {filteredGroups.length === 0 && urgentTables.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[var(--color-border-box)] p-10 text-center text-sm text-[var(--color-txt-secondary)]">
          No hay mesas para los filtros seleccionados.
        </div>
      ) : null}

      {undoNotice ? (
        <div className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl border border-[var(--color-border-box)] bg-[var(--color-foreground)] p-3 text-sm shadow-card md:bottom-4">
          <div className="min-w-0">
            <p className="font-semibold">Mesa atendida</p>
            <p className="truncate text-xs text-[var(--color-txt-secondary)]">{undoNotice.label}</p>
          </div>
          <button
            type="button"
            onClick={() => onUndoHandled(undoNotice.tableId)}
            className="shrink-0 cursor-pointer rounded-lg border border-[var(--color-button-send)] bg-[var(--color-bg-selected)] px-3 py-2 text-xs font-semibold text-[var(--color-txt-selected)]"
          >
            Deshacer
          </button>
        </div>
      ) : null}
    </div>
  );
}

function formatTimeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function getAlertNotificationText(eventType: string) {
  if (["bill", "account", "check", "request_bill", "bill_request"].includes(eventType)) {
    return "Una mesa solicito la cuenta.";
  }

  if (["order", "order_request", "place_order", "command_order"].includes(eventType)) {
    return "Una mesa envio un pedido.";
  }

  return "Una mesa solicito atencion.";
}

function RequestActionCard({
  active,
  icon,
  label,
  description,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  description: string;
}) {
  return (
    <div
      className={`flex min-w-0 items-start gap-2 rounded-lg border p-3 md:min-h-[5.75rem] ${
        active
          ? "animate-pulse border-[var(--color-button-send)]/30 bg-[var(--color-foreground)] text-[var(--color-txt-selected)] shadow-sm"
          : "border-[var(--color-border-box)] bg-[var(--color-foreground)] text-[var(--color-txt-secondary)]"
      }`}
    >
      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-bg-selected)] text-[var(--color-button-send)]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-tight">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-[var(--color-txt-secondary)]">{description}</span>
      </span>
    </div>
  );
}

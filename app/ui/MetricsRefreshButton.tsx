"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { RefreshCw } from "lucide-react";

export default function MetricsRefreshButton({ updatedAtLabel }: { updatedAtLabel: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function refreshMetrics() {
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
      <button
        type="button"
        onClick={refreshMetrics}
        disabled={isPending}
        className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--color-border-box)] bg-[var(--color-foreground)] px-4 text-sm font-medium text-[var(--color-txt-selected)] shadow-sm transition hover:border-[var(--color-button-send)] hover:bg-[var(--color-bg-selected)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw size={16} className={isPending ? "animate-spin" : ""} />
        {isPending ? "Actualizando..." : "Actualizar"}
      </button>
      <p className="text-xs text-[var(--color-txt-secondary)]">Actualizado {updatedAtLabel}</p>
    </div>
  );
}

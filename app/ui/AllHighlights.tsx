"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash } from "lucide-react";
import { Highlight } from "../lib/validators/types";

export default function AllHighlights({ highlights }: { highlights: Highlight[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="p-4 max-w-3xl flex flex-col">
      <div className="flex flex-col items-start gap-2">
        <h1 className="text-3xl font-bold">Todos los Destacados</h1>
        <p className="text-md text-[var(--color-txt-secondary)]">
          Visualiza las ofertas y destacados existentes. Los cambios se reflejarán inmediatamente en el menú.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
        {highlights.map((highlight) => (
          <div
            key={highlight.id}
            className="dark:bg-surface-dark rounded-xl shadow-card overflow-hidden flex flex-col bg-[var(--color-foreground)]"
          >
            <div className="relative">
              <img
                alt="Elegancia en Acero Inoxidable"
                className="w-full h-48 object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDK1_yG3f_rHpH6jJbRIHwz4vsHhcEstnV6x7OTAK9mMZg4JPYackyCxHWPH6UPvIkxGlDg3_2Ck7FPx6cHa2wssVZdpEXd4uKSzQn9KljMs96F5tmsA_4wCLFhF1AhUTZnKr7XmM-OtidSIfgnWmd7F-U2ryVTPbKv8KPEkQ66L-nays4WH3l9uzDfc24SExRGwqaHQ1tAVc0_kSfRacx2cGCnXhg04YShIprmi-CMc9rM-ZJP4o_HrlzSYo3tRXAjp60JmQr9Pd5T"
              />
            </div>
            <div className="p-4 flex flex-col flex-grow ">
              {/* <h3 className="text-md font-bold text-text-light dark:text-text-dark"></h3> */}
              <p className="mt-1 text-sm text-text-light/70 dark:text-text-dark/70 flex-grow">
                {highlight.description}
              </p>
              <div className="mt-4 pt-4 border-t border-[var(--color-border-box)] dark:border-border-dark flex items-center justify-end gap-2">
                <button className="cursor-pointer p-2 rounded-2xl text-[var(--color-light)] hover:text-[var(--color-light-hover)] hover:bg-[var(--color-cancel)] transition-colors">
                  <Pencil size={18} />
                </button>
                <button className="cursor-pointer p-2 rounded-2xl text-[var(--color-delete)] hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-[var(--color-delete-hover)] transition-colors">
                  <Trash size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

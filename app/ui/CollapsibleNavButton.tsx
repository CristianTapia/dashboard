"use client";

import { useId, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

type SubItem = { href: string; label: string };

export default function CollapsibleNavButton({
  icon,
  label,
  baseHref,
  items,
  defaultOpen,
}: {
  icon: React.ReactNode;
  label: string;
  baseHref: string;
  items: SubItem[];
  defaultOpen?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(defaultOpen ?? pathname?.startsWith(baseHref));
  const panelId = useId();

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        // ✅ mismo layout que tus otros ítems: columna fija para el ícono, texto, caret
        className="w-full flex items-center p-2 rounded-xl hover:bg-[var(--color-selected)]"
      >
        <span className="pr-3">{icon}</span>
        <span className="text-md font-semibold">{label}</span>
        <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* subitems alineados debajo del texto (20px icono + 8px gap = 28px) */}
      <ul id={panelId} hidden={!open} className="mt-1 pl-[28px] pr-2 space-y-1">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={`block rounded-lg px-3 py-1.5 text-sm ${
                  active
                    ? "bg-[var(--color-bg-selected)] text-[var(--color-txt-selected)] font-medium"
                    : "text-[var(--color-category)] hover:bg-[var(--color-bg-selected)]"
                }`}
              >
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </li>
  );
}

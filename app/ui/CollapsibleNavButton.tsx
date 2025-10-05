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
  baseHref: string; // ej: "/dashboard/productos"
  items: SubItem[];
  defaultOpen?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(defaultOpen ?? pathname?.startsWith(baseHref));
  const panelId = useId();

  return (
    <li className="select-none">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-[var(--color-selected)]"
      >
        <span className="pr-1">{icon}</span>
        <span className="flex-1 text-sm font-semibold">{label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : "rotate-0"}`} />
      </button>

      <ul id={panelId} hidden={!open} className="mt-1 pl-9 pr-2 space-y-1">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={`block rounded-lg px-2 py-1.5 text-sm
                  ${
                    active
                      ? "bg-[var(--color-selected)] font-medium"
                      : "text-[var(--color-category)] hover:bg-[var(--color-selected)]"
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

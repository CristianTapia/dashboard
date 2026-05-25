"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

type DashboardNavButtonProps = {
  href: string;
  name: string;
  icon: React.ReactNode;
  startsWith?: boolean;
  compact?: boolean;
};

export default function DashboardNavButton({ href, name, icon, startsWith = false, compact = false }: DashboardNavButtonProps) {
  const pathname = usePathname();
  const isActive = startsWith ? pathname?.startsWith(href) : pathname === href;

  if (compact) {
    return (
      <li className="shrink-0 min-w-[72px]">
        <Link
          href={href}
          prefetch={false}
          aria-current={isActive ? "page" : undefined}
          className={`flex h-14 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[11px] font-semibold transition-colors ${
            isActive
              ? "bg-[var(--color-bg-selected)] text-[var(--color-txt-selected)] shadow-sm"
              : "text-[var(--color-category)] hover:bg-[var(--color-bg-selected)]"
          }`}
        >
          <span>{icon}</span>
          <span className="max-w-[68px] truncate">{name}</span>
        </Link>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={href}
        prefetch={false}
        aria-current={isActive ? "page" : undefined}
        className={`flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
          isActive
            ? "bg-[var(--color-bg-selected)] text-[var(--color-txt-selected)] shadow-sm"
            : "text-[var(--color-category)] hover:bg-[var(--color-bg-selected)]"
        }`}
      >
        <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-surface-muted)]">{icon}</span>
        <span>{name}</span>
      </Link>
    </li>
  );
}

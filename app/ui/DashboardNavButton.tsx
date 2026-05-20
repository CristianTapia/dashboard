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
          className={`flex h-14 flex-col items-center justify-center gap-1 rounded-lg px-2 text-[11px] font-semibold ${
            isActive
              ? "bg-[var(--color-bg-selected)] text-[var(--color-txt-selected)]"
              : "text-[var(--color-category)]"
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
        className={`flex p-2 rounded-xl font-semibold text-md hover:bg-[var(--color-bg-selected)] items-center ${
          isActive
            ? "bg-[var(--color-bg-selected)] text-[var(--color-txt-selected)]"
            : "bg-[var(--color-foreground)] text-[var(--color-category)]"
        }`}
      >
        <div className="pr-3">{icon}</div>
        <div>{name}</div>
      </Link>
    </li>
  );
}

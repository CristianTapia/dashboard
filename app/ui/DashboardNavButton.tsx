"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

type DashboardNavButtonProps = {
  href: string;
  name: string;
  icon: React.ReactNode;
  startsWith?: boolean;
};

export default function DashboardNavButton({ href, name, icon, startsWith = false }: DashboardNavButtonProps) {
  const pathname = usePathname();
  const isActive = startsWith ? pathname?.startsWith(href) : pathname === href;

  return (
    <li>
      <Link
        href={href}
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

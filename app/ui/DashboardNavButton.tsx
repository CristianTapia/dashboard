import Link from "next/link";
import React from "react";

type DashboardNavButtonProps = {
  href: string;
  name: string;
  icon: React.ReactNode;
};

export default function DashboardNavButton({ href, name, icon }: DashboardNavButtonProps) {
  return (
    <li>
      <Link
        href={href}
        className="flex p-2 rounded-xl font-semibold text-md hover:bg-[var(--color-selected)] items-center"
      >
        <div className="pr-3">{icon}</div>
        <div>{name}</div>
      </Link>
    </li>
  );
}

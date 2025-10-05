import Link from "next/link";
import React from "react";

type DashboardButtonProps = {
  href: string;
  name: string;
  icon: React.ReactNode;
};

export default function DashboardButton({ href, name, icon }: DashboardButtonProps) {
  return (
    <li>
      <Link
        href={href}
        className="flex p-2 rounded-xl font-semibold text-sm hover:bg-[var(--color-selected)] items-center"
      >
        <div className="pr-2">{icon}</div>
        <div>{name}</div>
      </Link>
    </li>
  );
}

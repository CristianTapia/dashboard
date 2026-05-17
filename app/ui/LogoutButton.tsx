"use client";

import { useRouter } from "next/navigation";
import { supabaseClient } from "@/app/lib/supabase/client";
import { LogOut } from "lucide-react";

export default function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();

  async function handleLogout() {
    await supabaseClient.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (compact) {
    return (
      <button
        className="flex h-14 w-full flex-col items-center justify-center gap-1 rounded-lg px-2 text-[11px] font-semibold text-[var(--color-category)] cursor-pointer"
        type="button"
        onClick={handleLogout}
      >
        <LogOut size={20} />
        <span className="max-w-[68px] truncate">Salir</span>
      </button>
    );
  }

  return (
    <button
      className="flex w-full p-2 rounded-xl font-semibold text-md hover:bg-[var(--color-bg-selected)] items-center bg-[var(--color-foreground)] text-[var(--color-category)] cursor-pointer"
      type="button"
      onClick={handleLogout}
    >
      <div className="pr-3">
        <LogOut size={20} />
      </div>
      <div>Cerrar sesión</div>
    </button>
  );
}

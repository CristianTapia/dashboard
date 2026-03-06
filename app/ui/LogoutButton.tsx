"use client";

import { useRouter } from "next/navigation";
import { supabaseClient } from "@/app/lib/supabase/client";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await supabaseClient.auth.signOut();
    router.replace("/login");
    router.refresh();
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

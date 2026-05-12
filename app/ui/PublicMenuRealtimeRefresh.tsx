"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { supabaseClient } from "@/app/lib/supabase/client";

export default function PublicMenuRealtimeRefresh({ tenantId }: { tenantId: string }) {
  const router = useRouter();

  useEffect(() => {
    const channel = supabaseClient
      .channel(`public-menu:${tenantId}`)
      .on("broadcast", { event: "menu_updated" }, (event) => {
        if (event.payload?.tenantId === tenantId) {
          router.refresh();
        }
      })
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [router, tenantId]);

  return null;
}

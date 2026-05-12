import "server-only";

import { createAdmin } from "@/app/lib/supabase/Admin";

type MenuUpdatedPayload = {
  tenantId: string;
  updatedAt: string;
};

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Realtime broadcast timeout")), timeoutMs);
    }),
  ]);
}

export async function broadcastMenuUpdated(tenantId?: string | null) {
  if (!tenantId) return;

  const supabase = createAdmin();
  const channel = supabase.channel(`public-menu:${tenantId}`);

  try {
    await withTimeout(
      new Promise<void>((resolve, reject) => {
        channel.subscribe((status) => {
          if (status === "SUBSCRIBED") resolve();
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            reject(new Error(`Realtime channel ${status.toLowerCase()}`));
          }
        });
      }),
      2_000,
    );

    await withTimeout(
      channel.send({
        type: "broadcast",
        event: "menu_updated",
        payload: {
          tenantId,
          updatedAt: new Date().toISOString(),
        } satisfies MenuUpdatedPayload,
      }),
      2_000,
    );
  } catch (error) {
    console.error("broadcastMenuUpdated error:", error);
  } finally {
    await supabase.removeChannel(channel);
  }
}

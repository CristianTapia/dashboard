import "server-only";

import { createAdmin } from "@/app/lib/supabase/Admin";

type MenuUpdatedPayload = {
  tenantId: string;
  updatedAt: string;
};

type TableUpdatedPayload = {
  tableId: string;
  tableToken: string;
  tenantId: string;
  action: "created" | "updated" | "deleted";
  active?: boolean;
  updatedAt: string;
};

type TableAttentionUpdatedPayload = {
  tableId: string;
  tableToken?: string;
  tenantId: string;
  action: "created" | "handled";
  eventType?: string;
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

async function sendBroadcast(channelName: string, event: string, payload: unknown) {
  const supabase = createAdmin();
  const channel = supabase.channel(channelName, {
    config: {
      broadcast: { ack: true },
    },
  });

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
        event,
        payload,
      }),
      2_000,
    );
  } finally {
    await supabase.removeChannel(channel);
  }
}

export async function broadcastMenuUpdated(tenantId?: string | null) {
  if (!tenantId) return;

  try {
    await sendBroadcast(
      `public-menu:${tenantId}`,
      "menu_updated",
      {
        tenantId,
        updatedAt: new Date().toISOString(),
      } satisfies MenuUpdatedPayload,
    );
  } catch (error) {
    console.error("broadcastMenuUpdated error:", error);
  }
}

export async function broadcastTableUpdated({
  tableId,
  tableToken,
  tenantId,
  action = "updated",
  active,
}: {
  tableId?: string | null;
  tableToken?: string | null;
  tenantId?: string | null;
  action?: TableUpdatedPayload["action"];
  active?: boolean;
}) {
  if (!tableId || !tableToken || !tenantId) return;

  const payload = {
    tableId,
    tableToken,
    tenantId,
    action,
    ...(typeof active === "boolean" ? { active } : {}),
    updatedAt: new Date().toISOString(),
  } satisfies TableUpdatedPayload;

  try {
    await sendBroadcast(`public-menu:${tenantId}`, "table_updated", payload);
  } catch (error) {
    console.error("broadcastTableUpdated error:", error);
  }
}

export async function broadcastTableAttentionUpdated({
  tableId,
  tableToken,
  tenantId,
  action,
  eventType,
}: {
  tableId?: string | null;
  tableToken?: string | null;
  tenantId?: string | null;
  action: TableAttentionUpdatedPayload["action"];
  eventType?: string | null;
}) {
  if (!tableId || !tenantId) return;

  const payload = {
    tableId,
    ...(tableToken ? { tableToken } : {}),
    tenantId,
    action,
    ...(eventType ? { eventType } : {}),
    updatedAt: new Date().toISOString(),
  } satisfies TableAttentionUpdatedPayload;

  try {
    await sendBroadcast(`tenant-attention:${tenantId}`, "table_attention_updated", payload);
  } catch (error) {
    console.error("broadcastTableAttentionUpdated error:", error);
  }
}

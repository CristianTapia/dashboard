"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/app/lib/auth";
import { markTableAttentionHandled, reopenRecentlyHandledTableAttention } from "@/app/lib/data/attention";
import { broadcastTableAttentionUpdated } from "@/app/lib/realtime/menu";

export async function markTableAttentionHandledAction(tableId: string) {
  await requireUser();
  const handled = await markTableAttentionHandled(tableId);
  await broadcastTableAttentionUpdated({
    tableId: handled.tableId,
    tableToken: handled.tableToken,
    tenantId: handled.tenantId,
    action: "handled",
  });
  revalidatePath("/dashboard/atencion");
  return { ok: true };
}

export async function reopenRecentlyHandledTableAttentionAction(tableId: string) {
  await requireUser();
  const reopened = await reopenRecentlyHandledTableAttention(tableId);
  await broadcastTableAttentionUpdated({
    tableId: reopened.tableId,
    tableToken: reopened.tableToken,
    tenantId: reopened.tenantId,
    action: "reopened",
  });
  revalidatePath("/dashboard/atencion");
  return { ok: true };
}

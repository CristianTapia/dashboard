import { NextResponse } from "next/server";

import { requireUser } from "@/app/lib/auth";
import { reopenRecentlyHandledTableAttention } from "@/app/lib/data/attention";
import { broadcastTableAttentionUpdated } from "@/app/lib/realtime/menu";

export async function POST(_req: Request, { params }: { params: Promise<{ tableId: string }> }) {
  try {
    await requireUser();
    const { tableId } = await params;
    const reopened = await reopenRecentlyHandledTableAttention(tableId);

    await broadcastTableAttentionUpdated({
      tableId: reopened.tableId,
      tableToken: reopened.tableToken,
      tenantId: reopened.tenantId,
      action: "reopened",
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

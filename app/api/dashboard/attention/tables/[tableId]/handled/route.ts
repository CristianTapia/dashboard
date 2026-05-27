import { NextResponse } from "next/server";

import { requireUser } from "@/app/lib/auth";
import { markTableAttentionHandled } from "@/app/lib/data/attention";
import { broadcastTableAttentionUpdated } from "@/app/lib/realtime/menu";

export async function POST(_req: Request, { params }: { params: Promise<{ tableId: string }> }) {
  try {
    await requireUser();
    const { tableId } = await params;
    const handled = await markTableAttentionHandled(tableId);

    await broadcastTableAttentionUpdated({
      tableId: handled.tableId,
      tableToken: handled.tableToken,
      tenantId: handled.tenantId,
      action: "handled",
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

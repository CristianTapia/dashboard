import { NextResponse } from "next/server";
import { z } from "zod";

import { createPublicTableEvent, resolvePublicTableByToken } from "@/app/lib/data/public-tables";
import { limitByKey } from "@/app/lib/rate-limit";

const corsHeaders = {
  ...(process.env.CORS_ORIGIN ? { "Access-Control-Allow-Origin": process.env.CORS_ORIGIN } : {}),
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const CreatePublicTableEventSchema = z.object({
  event_type: z.string().trim().min(1).max(64),
  source: z.string().trim().min(1).max(64).optional(),
  route: z.string().trim().min(1).max(64).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request, { params }: { params: Promise<{ tableToken: string }> }) {
  try {
    const { tableToken: rawTableToken } = await params;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const limited = limitByKey(`public-table-events:${ip}:${rawTableToken}`, 240, 60_000);

    if (!limited.ok) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes, intenta nuevamente en unos segundos" },
        { status: 429, headers: { ...corsHeaders, "Retry-After": String(Math.ceil((limited.resetAt - Date.now()) / 1000)) } }
      );
    }

    let tableToken: string;
    try {
      tableToken = decodeURIComponent(rawTableToken).trim();
    } catch {
      return NextResponse.json({ error: "Token de mesa invalido" }, { status: 400, headers: corsHeaders });
    }

    if (!tableToken) {
      return NextResponse.json({ error: "Token de mesa invalido" }, { status: 400, headers: corsHeaders });
    }

    const body = await req.json();
    const parsed = CreatePublicTableEventSchema.parse(body);
    const table = await resolvePublicTableByToken(tableToken);

    if (!table) {
      return NextResponse.json({ error: "Mesa no encontrada" }, { status: 404, headers: corsHeaders });
    }

    await createPublicTableEvent({
      tableId: table.table.id,
      tenantId: table.table.tenant_id,
      eventType: parsed.event_type,
      metadata: {
        ...(parsed.metadata ?? {}),
        source: parsed.source ?? null,
        route: parsed.route ?? null,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201, headers: corsHeaders });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Payload invalido" }, { status: 400, headers: corsHeaders });
    }

    const message = error instanceof Error ? error.message : "Server error";
    console.error("POST /api/public/tables/[tableToken]/events error", { message, url: req.url });
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders });
  }
}

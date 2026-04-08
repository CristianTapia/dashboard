import { NextResponse } from "next/server";
import { z } from "zod";

import { resolvePublicTableByToken } from "@/app/lib/data/public-tables";
import { limitByKey } from "@/app/lib/rate-limit";
import { PublicTableTokenSchema } from "@/app/lib/validators/public-tables";

const corsHeaders = {
  ...(process.env.CORS_ORIGIN ? { "Access-Control-Allow-Origin": process.env.CORS_ORIGIN } : {}),
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: Request, { params }: { params: Promise<{ tableToken: string }> }) {
  try {
    const { tableToken: rawTableToken } = await params;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const limited = limitByKey(`public-table:${ip}:${rawTableToken}`, 180, 60_000);

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

    tableToken = PublicTableTokenSchema.parse(tableToken);

    const table = await resolvePublicTableByToken(tableToken);

    if (!table) {
      return NextResponse.json({ error: "Mesa no encontrada" }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json(table, { status: 200, headers: corsHeaders });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Token de mesa invalido" }, { status: 400, headers: corsHeaders });
    }
    const message = error instanceof Error ? error.message : "Server error";
    console.error("GET /api/public/tables/[tableToken] error", { message, url: req.url });
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders });
  }
}

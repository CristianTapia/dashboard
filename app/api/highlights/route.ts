// app/api/highlights/route.ts
import { NextResponse } from "next/server";
import { CreateHighlightSchema } from "@/app/lib/validators/highlights";
import { createHighlight, listHighlightsWithSigned } from "@/app/lib/data/highlights";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.CORS_ORIGIN ?? "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// [GET] READ HIGHLIGHTS (public API)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit") ?? 20)));
  const offset = Math.max(0, Number(searchParams.get("offset") ?? 0));
  try {
    const items = await listHighlightsWithSigned({ limit, offset, expires: 3600 });
    return NextResponse.json(items, { status: 200, headers: corsHeaders });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500, headers: corsHeaders });
  }
}

// [POST] WRITE HIGHLIGHTS
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateHighlightSchema.parse(body);
    const data = await createHighlight(parsed);
    return NextResponse.json(data, { status: 201, headers: corsHeaders });
  } catch (err: any) {
    const status = err?.name === "ZodError" ? 400 : 500;
    const message = err?.message || (status === 400 ? "Payload inválido" : "Server error");
    return NextResponse.json({ error: message }, { status, headers: corsHeaders });
  }
}

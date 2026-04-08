import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

import { requireUser } from "@/app/lib/auth";
import { limitByKey } from "@/app/lib/rate-limit";
import { SignedUrlRequestSchema } from "@/app/lib/validators/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const BUCKET = process.env.SB_BUCKET_NAME ?? "images";

const corsHeaders = {
  ...(process.env.CORS_ORIGIN ? { "Access-Control-Allow-Origin": process.env.CORS_ORIGIN } : {}),
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const limited = limitByKey(`signed:${ip}:${user.id}`, 120, 60_000);

    if (!limited.ok) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes, intenta nuevamente en unos segundos" },
        { status: 429, headers: { ...corsHeaders, "Retry-After": String(Math.ceil((limited.resetAt - Date.now()) / 1000)) } },
      );
    }

    const { searchParams } = new URL(req.url);
    const parsed = SignedUrlRequestSchema.parse({
      path: searchParams.get("path"),
      expires: searchParams.get("expires") ?? 3600,
    });

    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(parsed.path, parsed.expires);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }

    const now = Math.floor(Date.now() / 1000);
    return NextResponse.json(
      { url: data?.signedUrl ?? null, expires: parsed.expires, expiresAt: now + parsed.expires },
      { status: 200, headers: { ...corsHeaders, "Cache-Control": "no-store" } },
    );
  } catch (e: unknown) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message ?? "Payload invalido" }, { status: 400, headers: corsHeaders });
    }

    const message = e instanceof Error ? e.message : "Server error";
    const status = message === "Sesion no valida" ? 401 : 500;
    return NextResponse.json({ error: message }, { status, headers: corsHeaders });
  }
}

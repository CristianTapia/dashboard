// app/api/signed/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // solo server
);

// Usa env o cae por defecto a "images"
const BUCKET = process.env.SB_BUCKET_NAME ?? "images";

// Prefijos permitidos dentro del bucket
const ALLOWED_PREFIXES = ["products/", "highlights/"];

function isAllowedPath(p: string) {
  return typeof p === "string" && !p.includes("..") && ALLOWED_PREFIXES.some((pref) => p.startsWith(pref));
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get("path");
    const expiresParam = Number(searchParams.get("expires") ?? 3600); // 1h por defecto
    const expires = Math.min(Math.max(expiresParam, 60), 60 * 60 * 24); // entre 60s y 24h

    if (!path) {
      return NextResponse.json({ error: "path requerido" }, { status: 400 });
    }
    if (!isAllowedPath(path)) {
      return NextResponse.json({ error: "path inválido" }, { status: 400 });
    }

    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expires);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const now = Math.floor(Date.now() / 1000);
    const res = NextResponse.json({
      url: data?.signedUrl ?? null,
      expires, // segundos
      expiresAt: now + expires, // timestamp epoch
    });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}

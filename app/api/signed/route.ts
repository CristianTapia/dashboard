// app/api/signed/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // solo server
);

// Usa env o cae por defecto a "images"
const BUCKET = process.env.SB_BUCKET_NAME ?? "images";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");
  if (!path) return NextResponse.json({ error: "path requerido" }, { status: 400 });

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60); // 1h
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ url: data.signedUrl });
}

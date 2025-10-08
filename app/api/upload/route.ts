// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // solo server
);

const BUCKET = process.env.SB_BUCKET_NAME ?? "images";

// pequeña sanitización para evitar cosas raras
function sanitizeFolder(raw?: string | null) {
  const base = (raw ?? "products").toString().trim();
  const clean = base.replace(/^\/+|\/+$/g, "").replace(/[^a-z0-9/_-]/gi, "");
  return clean || "products";
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Solo imágenes" }, { status: 400 });
    }
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Máx 2MB" }, { status: 400 });
    }

    const folder = sanitizeFolder(formData.get("folder") as string | null); // 👈 products | highlights | ...
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const key = `${folder}/${crypto.randomUUID()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error } = await supabase.storage.from(BUCKET).upload(key, Buffer.from(arrayBuffer), {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // guarda `key` en DB (ej: "highlights/uuid.jpg")
    return NextResponse.json({ path: key }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

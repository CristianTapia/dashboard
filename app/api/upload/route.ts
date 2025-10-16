// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server only
);

const BUCKET = process.env.SB_BUCKET_NAME ?? "images";

// ✅ carpetas permitidas dentro del bucket (puedes agregar más)
const ALLOWED_FOLDERS = new Set(["products", "highlights", "banners"]);

// normaliza y valida carpeta; si no es válida, cae en "products"
function sanitizeFolder(raw?: string | null) {
  const base = (raw ?? "products").toString().trim();
  // quita slashes extremos y caracteres no permitidos
  const clean = base.replace(/^\/+|\/+$/g, "").replace(/[^a-z0-9/_-]/gi, "");
  // la raíz es lo que validamos contra la whitelist
  const root = (clean.split("/")[0] || "products").toLowerCase();
  if (!ALLOWED_FOLDERS.has(root)) return "products";
  // si pasó la raíz, retornamos la ruta limpia (puede incluir subcarpetas bajo la raíz permitida)
  return clean || "products";
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    if (!file.type?.startsWith("image/")) {
      return NextResponse.json({ error: "Solo imágenes" }, { status: 400 });
    }
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Máx 2MB" }, { status: 400 });
    }

    const folder = sanitizeFolder(formData.get("folder") as string | null); // p.ej. "products", "highlights/ofertas"
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const key = `${folder}/${crypto.randomUUID()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(key, Buffer.from(arrayBuffer), {
      contentType: file.type,
      cacheControl: "31536000", // 1 año
      upsert: false,
    });
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    // URL pública permanente (bucket debe ser público)
    const pub = supabase.storage.from(BUCKET).getPublicUrl(key);
    const image_url = pub.data.publicUrl;

    return NextResponse.json(
      { image_url, path: key, bucket: BUCKET },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}

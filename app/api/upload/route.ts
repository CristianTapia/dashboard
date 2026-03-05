import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireUser } from "@/app/lib/auth";
import { limitByKey } from "@/app/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const BUCKET = process.env.SB_BUCKET_NAME ?? "images";
const ALLOWED_FOLDERS = new Set(["products", "highlights", "banners"]);
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

function sanitizeFolder(raw?: string | null) {
  const base = (raw ?? "products").toString().trim();
  const clean = base.replace(/^\/+|\/+$/g, "").replace(/[^a-z0-9/_-]/gi, "");
  const root = (clean.split("/")[0] || "products").toLowerCase();
  if (!ALLOWED_FOLDERS.has(root)) return "products";
  return clean || "products";
}

function getClientKey(req: Request, userId: string) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return `${ip}:${userId}`;
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const key = getClientKey(req, user.id);
    const limited = limitByKey(`upload:${key}`, 20, 60_000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes, intenta nuevamente en unos segundos" },
        { status: 429, headers: { "Retry-After": String(Math.ceil((limited.resetAt - Date.now()) / 1000)) } }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    if (!file.type?.startsWith("image/")) return NextResponse.json({ error: "Solo imagenes" }, { status: 400 });
    if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: "Maximo 2MB" }, { status: 400 });

    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_EXT.has(ext)) return NextResponse.json({ error: "Extension no permitida" }, { status: 400 });

    const folder = sanitizeFolder(formData.get("folder") as string | null);
    const storagePath = `${folder}/${crypto.randomUUID()}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(storagePath, Buffer.from(arrayBuffer), {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    const pub = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    return NextResponse.json(
      { image_url: pub.data.publicUrl, path: storagePath, bucket: BUCKET },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Server error";
    const status = message === "Sesion no valida" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

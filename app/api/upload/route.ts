import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

import { requireUser } from "@/app/lib/auth";
import { limitByKey } from "@/app/lib/rate-limit";
import { UploadFileExtensionSchema, UploadFolderSchema } from "@/app/lib/validators/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const BUCKET = process.env.SB_BUCKET_NAME ?? "images";

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
        { status: 429, headers: { "Retry-After": String(Math.ceil((limited.resetAt - Date.now()) / 1000)) } },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    }
    if (!file.type?.startsWith("image/")) {
      return NextResponse.json({ error: "Solo imagenes" }, { status: 400 });
    }
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Maximo 2MB" }, { status: 400 });
    }

    const ext = UploadFileExtensionSchema.parse((file.name.split(".").pop() || "").toLowerCase());
    const folder = UploadFolderSchema.parse(formData.get("folder"));
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
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (e: unknown) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message ?? "Payload invalido" }, { status: 400 });
    }

    const message = e instanceof Error ? e.message : "Server error";
    const status = message === "Sesion no valida" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

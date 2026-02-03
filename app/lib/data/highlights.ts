import "server-only";
import { createAdmin } from "@/app/lib/supabase";
import { CreateHighlightInput, UpdateHighlightInput } from "@/app/lib/validators";
import { signPaths } from "@/app/lib/data/images"; // 👈 helper de firma en lote

const db = () => createAdmin();

export async function listHighlights({ limit = 20, offset = 0 }: { limit?: number; offset?: number } = {}) {
  const db = createAdmin();
  const { data, error } = await db
    .from("highlights")
    .select("id,description,image_path,created_at")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Igual que listHighlights, pero devuelve cada item con `image_url` firmado (temporal).
 * - Firma en lote para minimizar requests al storage.
 * - `expires` en segundos (default 1h).
 */

export async function listHighlightsWithSigned({
  limit = 20,
  offset = 0,
  expires = 3600,
}: { limit?: number; offset?: number; expires?: number } = {}) {
  const items = await listHighlights({ limit, offset });

  // junta paths y firma en 1 llamada
  const paths = items.map((p: any) => p.image_path).filter((x: any): x is string => !!x);
  const urlMap = await signPaths(paths, expires);

  // Mapea el resultado agregando `image_url` firmada y preservando path
  return items.map((p: any) => ({
    ...p,
    image_url: p.image_path ? (urlMap.get(p.image_path) ?? null) : null,
  }));
}

export async function createHighlight(input: CreateHighlightInput) {
  const { data, error } = await db().from("highlights").insert(input).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateHighlight(id: number, input: UpdateHighlightInput) {
  const db = createAdmin();
  const { data, error } = await db.from("highlights").update(input).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

const IMAGE_BUCKET = process.env.SB_BUCKET_NAME ?? "images";

export async function deleteHighlight(id: number) {
  const db = createAdmin();
  const { data, error } = await db
    .from("highlights")
    .delete()
    .eq("id", id)
    .select("id, image_path")
    .maybeSingle<{ id: number; image_path: string | null }>();
  if (error) throw new Error(error.message);

  if (!data) {
    return { ok: true };
  }

  if (data.image_path) {
    const { error: storageError } = await db.storage.from(IMAGE_BUCKET).remove([data.image_path]);
    if (storageError) {
      console.error("deleteHighlight storage error:", storageError);
      throw new Error("Destacado eliminado pero no se pudo eliminar la imagen asociada");
    }
  }

  return { ok: true };
}

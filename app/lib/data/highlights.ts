import "server-only";
import { createSupabaseAdmin } from "@/app/lib/supabase";
import { CreateHighlightInput, UpdateHighlightInput } from "@/app/lib/validators";
import { signPaths } from "@/app/lib/data/images"; // 👈 helper de firma en lote

const db = () => createSupabaseAdmin();

export async function listHighlights({ limit = 20, offset = 0 }: { limit?: number; offset?: number } = {}) {
  const db = createSupabaseAdmin();
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
    image_url: p.image_path ? urlMap.get(p.image_path) ?? null : null,
  }));
}

export async function createHighlight(input: CreateHighlightInput) {
  const { data, error } = await db().from("highlights").insert(input).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateHighlight(id: number, input: UpdateHighlightInput) {
  const db = createSupabaseAdmin();
  const { data, error } = await db.from("highlights").update(input).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteHighlight(id: number) {
  const db = createSupabaseAdmin();
  const { error } = await db.from("highlights").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

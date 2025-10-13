import "server-only";
import { createSupabaseAdmin } from "@/app/lib/supabase";
import { CreateHighlightInput, UpdateHighlightInput } from "@/app/lib/validators";

const db = () => createSupabaseAdmin();

export async function listHighlights(limit = 20, offset = 0) {
  const { data, error } = await db()
    .from("highlights")
    .select("id,description,image_url,created_at")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new Error(error.message);
  return data ?? [];
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

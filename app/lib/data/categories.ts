// (SERVER)
import { createSupabaseAdmin } from "@/app/lib/supabase"; // tu factory
import { CreateCategoryInput, UpdateCategoryInput } from "../validators";

export async function listCategories({ limit = 20, offset = 0 } = {}) {
  const db = createSupabaseAdmin();
  const { data, error } = await db
    .from("categories")
    .select("id,name,created_at")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createCategory(input: CreateCategoryInput) {
  const db = createSupabaseAdmin();
  const { data, error } = await db.from("categories").insert(input).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateCategory(id: number, input: UpdateCategoryInput) {
  const db = createSupabaseAdmin();
  const { data, error } = await db.from("categories").update(input).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCategory(id: number) {
  const db = createSupabaseAdmin();
  const { error } = await db.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

// (SERVER)
import "server-only";
import { createSupabaseAdmin } from "@/app/lib/supabase"; // tu factory
import { CreateCategoryInput, UpdateCategoryInput } from "../validators";

export async function listCategories() {
  const db = createSupabaseAdmin();
  const { data, error } = await db.from("categories").select("id,name").order("name", { ascending: false });
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

// app/api/categories/route.ts
import { NextResponse } from "next/server";
import { createAdmin } from "@/app/lib/supabase";
import { CreateCategorySchema } from "@/app/lib/validators/categories";

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.CORS_ORIGIN ?? "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// Maneja GET y POST de categorías (public GET)
export async function GET() {
  const db = createAdmin();
  const { data, error } = await db.from("categories").select("id, name").order("name", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  return NextResponse.json(data, { status: 200, headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = CreateCategorySchema.parse(body);
    const db = createAdmin();
    const { data, error } = await db
      .from("categories")
      .upsert({ name }, { onConflict: "name" })
      .select("id, name")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
    return NextResponse.json(data, { status: 200, headers: corsHeaders });
  } catch (err: any) {
    const status = err?.name === "ZodError" ? 400 : 500;
    const message = err?.message || (status === 400 ? "Payload inválido" : "Server error");
    return NextResponse.json({ error: message }, { status, headers: corsHeaders });
  }
}

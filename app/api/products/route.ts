import { NextResponse } from "next/server";
import { createServer } from "@/app/lib/supabase/Server";
import { CreateProductInput, CreateProductSchema } from "@/app/lib/validators/product";

// [GET] READ PRODUCTS FROM THE DATABASE
export async function GET() {
  const supabase = await createServer();
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// [POST] CREATE A NEW PRODUCT IN THE DATABASE
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📦 BODY RECIBIDO:", body);
    const parsed = CreateProductSchema.parse(body);
    const supabase = await createServer();
    const { data, error } = await supabase.from("products").insert([parsed]).select().single();

    if (error) {
      console.error("❌ SUPABASE ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error("❌ VALIDATION ERROR:", err);
    return NextResponse.json({ error: err.message || "Error al procesar la solicitud" }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { createServer } from "@/app/lib/supabase/Server";
import { CreateProductSchema } from "@/app/lib/validators/product";

// [GET] READ PRODUCTS FROM THE DATABASE
export async function GET() {
  const supabase = await createServer();
  const { data, error } = await supabase
    .from("products")
    .select(
      `id,
      name,
      price,
      stock,
      description,
      image_path,
      category:category_id ( id, name )`
    )
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  // Normalizar "category" a objeto|null
  const mapped = (data ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    stock: p.stock,
    description: p.description ?? null,
    image_path: p.image_path ?? null,
    category: Array.isArray(p.category) ? p.category[0] ?? null : p.category ?? null,
  }));

  return NextResponse.json(mapped);
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

// [PUT] EDIT A PRODUCT IN THE DATABASE
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createServer();
  const id = Number(params.id);
  const body = await req.json(); // { name, price, stock, description, category_id, image_path, ... }

  // (opcional) valida body con Zod antes de seguir

  const { data, error } = await supabase
    .from("products")
    .update({
      name: body.name,
      price: Number(body.price),
      stock: Number(body.stock) || 0,
      description: body.description ?? null,
      category_id: body.category_id ?? null,
      // image_path: body.image_path ?? null,
      // is_published: body.is_published ?? true,
    })
    .eq("id", id)
    // .select("id,name,price,stock,description,category_id,image_path,updated_at")
    .select("id, name, price, stock, description, category_id, updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data); // o 204 No Content si no necesitas devolver nada
}

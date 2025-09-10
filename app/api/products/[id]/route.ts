import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // usa la service role solo en el server
);

// [PUT] EDIT A PRODUCT IN THE DATABASE
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json(); // datos enviados desde el front
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing product id in URL (/api/products/:id)" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("products")
      .update({
        name: body.name,
        price: Number(body.price),
        stock: Number(body.stock) || 0,
        description: body.description ?? null,
        category_id: body.category_id ?? null,
        // image_path: body.image_path ?? null,
        // is_published: body.is_published ?? true,) // 👈 los campos a actualizar
      })
      .eq("id", Number(id)) // 👈 condición de qué registro actualizar
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

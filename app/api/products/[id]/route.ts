import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// [PUT] EDIT A PRODUCT IN THE DATABASE
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing product id in URL (/api/products/:id)" }, { status: 400 });
    }

    const catId = Number(body.category_id);
    if (!Number.isInteger(catId)) {
      return NextResponse.json({ error: "category_id es obligatorio" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      name: body.name,
      price: Number(body.price),
      stock: Number(body.stock) || 0,
      description: body.description ?? null,
      category_id: catId,
    };

    if (Object.prototype.hasOwnProperty.call(body, "image_path")) {
      const rawImage = body.image_path;
      updates.image_path =
        typeof rawImage === "string" && rawImage.trim() !== "" ? rawImage : null;
    }

    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", Number(id))
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// [DELETE] DELETE A PRODUCT IN THE DATABASE
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;

    if (!id) {
      return NextResponse.json({ error: "Missing product id in URL (/api/products/:id)" }, { status: 400 });
    }

    const productId = Number(id);
    if (!Number.isFinite(productId)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)
      .select("id, image_path")
      .maybeSingle<{ id: number; image_path: string | null }>();

    if (error) {
      console.error("DELETE /products error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (data.image_path) {
      const { error: storageError } = await supabase.storage.from("product-images").remove([data.image_path]);
      if (storageError) {
        console.error("DELETE /products storage error:", storageError);
        return NextResponse.json({ error: "Product deleted but failed to remove associated image" }, { status: 500 });
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    console.error("DELETE handler crash:", err);
    return NextResponse.json({ error: err?.message ?? "Internal Server Error" }, { status: 500 });
  }
}


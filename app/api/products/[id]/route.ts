import { NextResponse } from "next/server";
import { updateProduct, deleteProduct } from "@/app/lib/data/products";
import { requireUser } from "@/app/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireUser();
    const body = await req.json();
    const { id } = await params;
    const productId = Number(id);

    if (!Number.isFinite(productId)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const payload: {
      name?: string;
      price?: number;
      stock?: number;
      category_id?: number;
      description?: string;
      image_path?: string | null;
    } = {};

    if (typeof body.name === "string") payload.name = body.name;
    if (typeof body.price !== "undefined") payload.price = Number(body.price);
    if (typeof body.stock !== "undefined") payload.stock = Number(body.stock);
    if (typeof body.category_id !== "undefined") payload.category_id = Number(body.category_id);
    if (typeof body.description !== "undefined") payload.description = body.description;
    if (Object.prototype.hasOwnProperty.call(body, "image_path")) {
      const raw = body.image_path;
      payload.image_path = typeof raw === "string" && raw.trim() !== "" ? raw : null;
    }

    const data = await updateProduct(productId, payload);
    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    const status = message === "Sesion no valida" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireUser();
    const { id } = await ctx.params;
    const productId = Number(id);

    if (!Number.isFinite(productId)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    await deleteProduct(productId);
    return new NextResponse(null, { status: 204 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    const status = message === "Sesion no valida" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

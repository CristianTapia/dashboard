import { NextResponse } from "next/server";
import { z } from "zod";
import { updateProduct, deleteProduct } from "@/app/lib/data/products";
import { requireUser } from "@/app/lib/auth";
import { UpdateProductSchema } from "@/app/lib/validators/products";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireUser();
    const body = await req.json();
    const { id } = await params;
    const productId = Number(id);

    if (!Number.isFinite(productId)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }
    const payload = UpdateProductSchema.parse(body);
    const data = await updateProduct(productId, payload);
    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Payload invalido" }, { status: 400 });
    }
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

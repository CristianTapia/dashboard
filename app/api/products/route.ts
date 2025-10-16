import { NextResponse } from "next/server";
import { CreateProductSchema } from "@/app/lib/validators/products";
import { listProductsWithSigned, createProduct } from "@/app/lib/data/products";

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.CORS_ORIGIN ?? "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// [GET] READ PRODUCTS (public API)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit") ?? 20)));
  const offset = Math.max(0, Number(searchParams.get("offset") ?? 0));
  try {
    const items = await listProductsWithSigned({ limit, offset, expires: 3600 });
    return NextResponse.json(items, { status: 200, headers: corsHeaders });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500, headers: corsHeaders });
  }
}

// [POST] CREATE A NEW PRODUCT
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateProductSchema.parse(body);
    const data = await createProduct(parsed);
    return NextResponse.json(data, { status: 201, headers: corsHeaders });
  } catch (err: any) {
    const status = err?.name === "ZodError" ? 400 : 500;
    const message = err?.message || (status === 400 ? "Payload inválido" : "Server error");
    return NextResponse.json({ error: message }, { status, headers: corsHeaders });
  }
}


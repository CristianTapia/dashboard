import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { CreateCategorySchema } from "@/app/lib/validators/categories";
import { createCategory, listCategories } from "@/app/lib/data/categories";
import { requireUser } from "@/app/lib/auth";

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.CORS_ORIGIN ?? "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  try {
    await requireUser();
    const categories = await listCategories();
    const data = categories.map((c) => ({ id: c.id, name: c.name }));
    return NextResponse.json(data, { status: 200, headers: corsHeaders });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    const status = message === "Sesion no valida" ? 401 : 500;
    return NextResponse.json({ error: message }, { status, headers: corsHeaders });
  }
}

export async function POST(request: Request) {
  try {
    await requireUser();
    const body = await request.json();
    const { name } = CreateCategorySchema.parse(body);
    const data = await createCategory({ name });
    return NextResponse.json({ id: data.id, name: data.name }, { status: 200, headers: corsHeaders });
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Payload invalido" }, { status: 400, headers: corsHeaders });
    }
    const message = err instanceof Error ? err.message : "Server error";
    const status = message === "Sesion no valida" ? 401 : 500;
    return NextResponse.json({ error: message }, { status, headers: corsHeaders });
  }
}

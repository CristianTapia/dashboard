import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { CreateProductSchema } from "@/app/lib/validators/products";
import { listProductsWithSigned, createProduct } from "@/app/lib/data/products";
import { getCurrentUserOptional, requireUser } from "@/app/lib/auth";
import { listPublicProductsByTenant, resolveTenantByPublicKey } from "@/app/lib/data/public-menu";

const corsHeaders = {
  ...(process.env.CORS_ORIGIN ? { "Access-Control-Allow-Origin": process.env.CORS_ORIGIN } : {}),
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit") ?? 20)));
    const offset = Math.max(0, Number(searchParams.get("offset") ?? 0));
    const tenantKey = searchParams.get("tenant");
    const user = await getCurrentUserOptional();

    let items;
    if (user) {
      items = await listProductsWithSigned({ limit, offset, expires: 3600 });
    } else {
      if (!tenantKey) {
        return NextResponse.json({ error: "Sesion no valida" }, { status: 401, headers: corsHeaders });
      }
      const tenant = await resolveTenantByPublicKey(tenantKey);
      if (!tenant) {
        return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404, headers: corsHeaders });
      }
      items = await listPublicProductsByTenant(tenant.id, { limit, offset });
    }

    return NextResponse.json(items, { status: 200, headers: corsHeaders });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Server error";
    const status = message === "Sesion no valida" ? 401 : 500;
    return NextResponse.json({ error: message }, { status, headers: corsHeaders });
  }
}

export async function POST(req: Request) {
  try {
    await requireUser();
    const body = await req.json();
    const parsed = CreateProductSchema.parse(body);
    const data = await createProduct(parsed);
    return NextResponse.json(data, { status: 201, headers: corsHeaders });
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Payload invalido" }, { status: 400, headers: corsHeaders });
    }
    const message = err instanceof Error ? err.message : "Server error";
    const status = message === "Sesion no valida" ? 401 : 500;
    return NextResponse.json({ error: message }, { status, headers: corsHeaders });
  }
}

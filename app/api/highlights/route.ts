import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { CreateHighlightSchema } from "@/app/lib/validators/highlights";
import { createHighlight, listHighlightsWithSigned } from "@/app/lib/data/highlights";
import { getCurrentUserOptional, requireUser } from "@/app/lib/auth";
import { listPublicHighlightsByTenant, resolveTenantByPublicKey } from "@/app/lib/data/public-menu";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    const items = user
      ? await listHighlightsWithSigned({ limit, offset, expires: 3600 })
      : await (async () => {
          if (!tenantKey) throw new Error("Sesion no valida");
          const tenant = await resolveTenantByPublicKey(tenantKey);
          if (!tenant) throw new Error("Tenant no encontrado");
          return listPublicHighlightsByTenant(tenant.id, { limit, offset });
        })();

    return NextResponse.json(items, { status: 200, headers: corsHeaders });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Server error";
    const status = message === "Sesion no valida" ? 401 : message === "Tenant no encontrado" ? 404 : 500;
    return NextResponse.json({ error: message }, { status, headers: corsHeaders });
  }
}

export async function POST(req: Request) {
  try {
    await requireUser();
    const body = await req.json();
    const parsed = CreateHighlightSchema.parse(body);
    const data = await createHighlight(parsed);
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

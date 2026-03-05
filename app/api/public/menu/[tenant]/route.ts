import { NextResponse } from "next/server";
import { listPublicProductsByTenant, resolveTenantByPublicKey } from "@/app/lib/data/public-menu";
import { limitByKey } from "@/app/lib/rate-limit";

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.CORS_ORIGIN ?? "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: Request, { params }: { params: Promise<{ tenant: string }> }) {
  try {
    const { tenant: tenantParam } = await params;
    const { searchParams } = new URL(req.url);
    const limit = Math.max(1, Math.min(200, Number(searchParams.get("limit") ?? 200)));
    const offset = Math.max(0, Number(searchParams.get("offset") ?? 0));
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const limited = limitByKey(`public-menu:${ip}:${tenantParam}`, 120, 60_000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes, intenta nuevamente en unos segundos" },
        { status: 429, headers: { ...corsHeaders, "Retry-After": String(Math.ceil((limited.resetAt - Date.now()) / 1000)) } }
      );
    }

    const tenantKey = decodeURIComponent(tenantParam);
    const tenant = await resolveTenantByPublicKey(tenantKey);

    if (!tenant) {
      return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404, headers: corsHeaders });
    }

    const items = await listPublicProductsByTenant(tenant.id, { limit, offset });

    return NextResponse.json(
      {
        tenant: { id: tenant.id, name: tenant.name, domain: tenant.domain },
        products: items,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    console.error("GET /api/public/menu/[tenant] error", { message, url: req.url });
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders });
  }
}

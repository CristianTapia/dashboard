import { NextResponse } from "next/server";
import { listPublicProductsByTenant, resolveTenantByPublicKey } from "@/app/lib/data/public-menu";

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.CORS_ORIGIN ?? "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(_req: Request, { params }: { params: { tenant: string } }) {
  try {
    const tenantKey = decodeURIComponent(params.tenant);
    const tenant = await resolveTenantByPublicKey(tenantKey);

    if (!tenant) {
      return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404, headers: corsHeaders });
    }

    const items = await listPublicProductsByTenant(tenant.id, { limit: 200 });

    return NextResponse.json(
      {
        tenant: { id: tenant.id, name: tenant.name, domain: tenant.domain },
        products: items,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders });
  }
}

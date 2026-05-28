import { NextResponse } from "next/server";
import { z } from "zod";

import { createAdmin } from "@/app/lib/supabase";
import { createPublicTableEvent, resolvePublicTableByToken } from "@/app/lib/data/public-tables";
import { limitByKey } from "@/app/lib/rate-limit";
import { broadcastTableAttentionUpdated } from "@/app/lib/realtime/menu";
import { CreatePublicTableEventSchema, PublicTableTokenSchema } from "@/app/lib/validators/public-tables";

const corsHeaders = {
  ...(process.env.CORS_ORIGIN ? { "Access-Control-Allow-Origin": process.env.CORS_ORIGIN } : {}),
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const ORDER_EVENT_TYPES = new Set(["order", "order_request", "place_order", "command_order"]);

type ProductRow = {
  id: number;
  name: string;
  price: number;
  active: boolean | null;
};

type ClientOrderItem = {
  id: number;
  quantity: number;
  notes?: string;
};

class BadRequestError extends Error {}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

function readOrderItems(metadata: Record<string, unknown> | undefined) {
  const rawItems = metadata?.items ?? metadata?.cart ?? metadata?.products ?? metadata?.orderItems;
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new BadRequestError("La comanda debe incluir productos");
  }

  return rawItems.map((rawItem, index): ClientOrderItem => {
    if (!rawItem || typeof rawItem !== "object") {
      throw new BadRequestError(`Producto invalido en la posicion ${index + 1}`);
    }

    const item = rawItem as Record<string, unknown>;
    const rawId = item.id ?? item.productId ?? item.product_id;
    const productId = typeof rawId === "number" ? rawId : typeof rawId === "string" ? Number(rawId) : NaN;
    if (!Number.isInteger(productId) || productId <= 0) {
      throw new BadRequestError(`Producto invalido en la posicion ${index + 1}`);
    }

    const rawQuantity = item.quantity ?? item.qty ?? item.count ?? 1;
    const quantity = typeof rawQuantity === "number" ? rawQuantity : typeof rawQuantity === "string" ? Number(rawQuantity) : NaN;
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 99) {
      throw new BadRequestError(`Cantidad invalida para el producto ${productId}`);
    }

    const notes = typeof item.notes === "string" ? item.notes.trim().slice(0, 240) : undefined;

    return {
      id: productId,
      quantity,
      ...(notes ? { notes } : {}),
    };
  });
}

async function buildSafeOrderMetadata({
  tenantId,
  metadata,
}: {
  tenantId: string;
  metadata: Record<string, unknown> | undefined;
}) {
  const clientItems = readOrderItems(metadata);
  const productIds = Array.from(new Set(clientItems.map((item) => item.id)));
  const db = createAdmin();

  const { data, error } = await db
    .from("products")
    .select("id,name,price,active")
    .eq("tenant_id", tenantId)
    .in("id", productIds)
    .or("active.is.null,active.eq.true");

  if (error) throw new Error(error.message);

  const productsById = new Map(((data ?? []) as ProductRow[]).map((product) => [product.id, product]));
  const missingProductId = productIds.find((productId) => !productsById.has(productId));
  if (missingProductId) {
    throw new BadRequestError(`Producto invalido o no disponible: ${missingProductId}`);
  }

  const items = clientItems.map((item) => {
    const product = productsById.get(item.id);
    if (!product) throw new BadRequestError(`Producto invalido o no disponible: ${item.id}`);

    const price = Number(product.price);
    const lineTotal = price * item.quantity;

    return {
      id: product.id,
      name: product.name,
      quantity: item.quantity,
      price,
      ...(item.notes ? { notes: item.notes } : {}),
      lineTotal,
    };
  });

  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    items,
    total,
    currency: "CLP",
    source: "menu",
  };
}

export async function POST(req: Request, { params }: { params: Promise<{ tableToken: string }> }) {
  try {
    const { tableToken: rawTableToken } = await params;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const limited = limitByKey(`public-table-events:${ip}:${rawTableToken}`, 240, 60_000);

    if (!limited.ok) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes, intenta nuevamente en unos segundos" },
        { status: 429, headers: { ...corsHeaders, "Retry-After": String(Math.ceil((limited.resetAt - Date.now()) / 1000)) } }
      );
    }

    let tableToken: string;
    try {
      tableToken = decodeURIComponent(rawTableToken).trim();
    } catch {
      return NextResponse.json({ error: "Token de mesa invalido" }, { status: 400, headers: corsHeaders });
    }

    tableToken = PublicTableTokenSchema.parse(tableToken);

    const body = await req.json();
    const parsed = CreatePublicTableEventSchema.parse(body);
    const table = await resolvePublicTableByToken(tableToken);

    if (!table) {
      return NextResponse.json({ error: "Mesa no encontrada" }, { status: 404, headers: corsHeaders });
    }

    const safeMetadata = ORDER_EVENT_TYPES.has(parsed.event_type)
      ? await buildSafeOrderMetadata({
          tenantId: table.table.tenant_id,
          metadata: parsed.metadata,
        })
      : {
          ...(parsed.metadata ?? {}),
          source: parsed.source ?? null,
          route: parsed.route ?? null,
        };

    await createPublicTableEvent({
      tableId: table.table.id,
      tenantId: table.table.tenant_id,
      eventType: parsed.event_type,
      metadata: safeMetadata,
    });

    await broadcastTableAttentionUpdated({
      tableId: table.table.id,
      tableToken: table.table.public_token,
      tenantId: table.table.tenant_id,
      action: "created",
      eventType: parsed.event_type,
    });

    return NextResponse.json({ ok: true }, { status: 201, headers: corsHeaders });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Payload invalido" }, { status: 400, headers: corsHeaders });
    }
    if (error instanceof BadRequestError) {
      return NextResponse.json({ error: error.message }, { status: 400, headers: corsHeaders });
    }

    const message = error instanceof Error ? error.message : "Server error";
    console.error("POST /api/public/tables/[tableToken]/events error", { message, url: req.url });
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders });
  }
}

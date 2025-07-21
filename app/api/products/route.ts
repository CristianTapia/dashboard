import { NextResponse } from "next/server";

const REST_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products`;
const API_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Get all products
export async function GET() {
  console.log("🔍 Llamaron a /api/products");
  const res = await fetch(`${REST_URL}?select=*&order=created_at.desc`, {
    headers: {
      apikey: API_KEY,
      authorization: `Bearer ${API_KEY}`,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }

  const data = await res.json();
  console.log("→ data:", data);
  return NextResponse.json(data);
}

// Create a new product
export async function POST(request: Request) {
  try {
    // 1) Leemos el body JSON que envía el cliente
    const { name, price, category, stock, image_url } = await request.json();

    // 2) Disparamos un POST al REST de Supabase
    const res = await fetch(REST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: API_KEY,
        authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        name,
        price,
        category,
        stock: stock ?? null,
        image_url: image_url ?? null,
      }),
    });

    // 3) Si hay error, lo devolvemos
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    // 4) OK, devolvemos el registro insertado
    const created = await res.json();
    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    // Type guard para extraer mensaje si es Error
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

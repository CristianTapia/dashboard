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

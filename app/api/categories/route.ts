// app/api/categories/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET() {
  const { data, error } = await supabase.from("categories").select("id, name").order("name", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// export async function POST(request: Request) {
//   const { name } = (await request.json()) as { name: string };
//   const { data, error } = await supabase
//     .from("categories")
//     .upsert({ name }, { onConflict: "name" })
//     .select("id, name")
//     .single();

//   if (error) return NextResponse.json({ error: error.message }, { status: 500 });
//   return NextResponse.json(data, { status: 201 });
// }

export async function POST(request: Request) {
  const body = await request.json();

  // const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const { data, error } = await supabase.from("categories").insert([body]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 200 });
}

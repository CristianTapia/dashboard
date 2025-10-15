// app/api/highlights/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServer } from "@/app/lib/supabase/server";
import { CreateHighlightSchema } from "@/app/lib/validators/highlights";

// Asegura runtime Node (necesario para usar la Service Role)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // solo en server
);

// [GET] READ HIGHLIGHTS FROM THE DATABASE
export async function GET() {
  const { data, error } = await supabase
    .from("highlights")
    .select("id, description, image_url, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// [POST] WRITE HIGHLIGTHS TO THE DATABASE
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = CreateHighlightSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Payload inválido", issues: parsed.error.flatten() }, { status: 400 });
    }

    // ✅ ahora sí: tomamos los valores validados
    const { description, image_url } = parsed.data;

    const { data, error } = await supabase.from("highlights").insert({ description, image_url }).select().single();

    if (error) {
      console.error("[SUPABASE INSERT ERROR]", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error("[API HIGHLIGHTS ERROR]", err);
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}

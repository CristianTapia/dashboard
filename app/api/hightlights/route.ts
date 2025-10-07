// app/api/categories/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// [POST] CREATE A NEW PRODUCT IN THE DATABASE
// Usa la service role SOLO en el server
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// [POST] SUBIT DATOS A LA TABLA HIGHLIGHTS
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Description obligatoria
    const description = typeof body.description === "string" ? body.description.trim() : "";

    if (!description) {
      return NextResponse.json({ error: "description es obligatoria" }, { status: 400 });
    }

    // image_url opcional: string no vacío o null
    let image_url: string | null = null;
    if (Object.prototype.hasOwnProperty.call(body, "image_url")) {
      const raw = body.image_url;
      image_url = typeof raw === "string" && raw.trim() !== "" ? raw : null;
    }

    const { data, error } = await supabase.from("highlights").insert({ description, image_url }).select().single(); // devuelve el registro insertado

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 201 Created
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

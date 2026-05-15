import { NextResponse } from "next/server";
import { resolveEmailByLoginName } from "@/app/lib/data/users";
import { createServer } from "@/app/lib/supabase/Server";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { loginName?: unknown; password?: unknown };
    const identifier = typeof body.loginName === "string" ? body.loginName.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!identifier || !password) {
      return NextResponse.json({ error: "Credenciales invalidas" }, { status: 400 });
    }

    const email = identifier.includes("@") ? identifier : await resolveEmailByLoginName(identifier);

    if (!email) {
      return NextResponse.json({ error: "Credenciales invalidas" }, { status: 401 });
    }

    const supabase = await createServer();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return NextResponse.json({ error: "Credenciales invalidas" }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Credenciales invalidas" }, { status: 401 });
  }
}

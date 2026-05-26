import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { resolveEmailByLoginName, userHasActiveTenant } from "@/app/lib/data/users";
import { createServer } from "@/app/lib/supabase/Server";

async function clearSupabaseAuthCookies() {
  const cookieStore = await cookies();

  for (const cookie of cookieStore.getAll()) {
    if (cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token")) {
      cookieStore.delete(cookie.name);
    }
  }
}

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

    await clearSupabaseAuthCookies();

    const supabase = await createServer();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return NextResponse.json({ error: "Credenciales invalidas" }, { status: 401 });
    }

    const hasActiveTenant = await userHasActiveTenant(email);
    if (!hasActiveTenant) {
      await supabase.auth.signOut();
      await clearSupabaseAuthCookies();
      return NextResponse.json({ error: "Este tenant se encuentra inactivo" }, { status: 403 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Credenciales invalidas" }, { status: 401 });
  }
}

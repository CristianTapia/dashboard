"use client";

import { createBrowserClient } from "@supabase/ssr";

// Usa el cliente SSR en el navegador para que las sesiones se guarden en cookies
// y sean visibles desde el servidor (RLS).
export const supabaseClient = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

import Products from "@/app/ui/Products";
import { createClient } from "@supabase/supabase-js";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function ProductsPage() {
  const supabase = createServerComponentClient({ cookies });

  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("created_at", { ascending: false });

  return <Products categories={data ?? []} products={[]} />;
}

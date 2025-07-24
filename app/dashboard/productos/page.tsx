import Products from "@/app/ui/Products";
import { createClient } from "@supabase/supabase-js";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function ProductsPage() {
  const supabase = createServerComponentClient({ cookies });

  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, stock, category:categories(name)")
    .order("created_at", { ascending: false });

  const products = (data ?? []).map((p) => ({
    ...p,
    category: Array.isArray(p.category) && p.category.length > 0 ? p.category[0].name : "Sin categoría",
  }));

  return <Products products={products} />;
}

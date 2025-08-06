import Products from "@/app/ui/Products";
import { createServer } from "@/app/lib/supabase/Server";

export default async function ProductsPage() {
  const supabase = await createServer();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("created_at", { ascending: false });

  return <Products products={[]} categories={data ?? []} />;
}

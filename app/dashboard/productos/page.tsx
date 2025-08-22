import Products from "@/app/ui/Products";
import { createServer } from "@/app/lib/supabase/Server";
import { createSupabaseAdmin } from "@/app/lib/supabase/Admin";

// export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const supabase = await createServer();

  // SALTARSE LA API PARA TRAER PRODUCTOS
  // 1) traer categorías y productos
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, stock, description, category:categories(id, name), image_path")
    .order("name", { ascending: true });

  if (error) throw error;

  // 2) firmar imágenes (server only)
  const admin = createSupabaseAdmin();
  const paths = (products ?? []).map((p) => p.image_path).filter((p): p is string => !!p);

  const mapPathToUrl = new Map<string, string>();
  if (paths.length) {
    const { data: signed, error: signErr } = await admin.storage
      .from("product-images") // <- Supabase bucket
      .createSignedUrls(paths, 60 * 60); // 1 hora

    if (signErr) {
      console.error("Error firmando imágenes:", signErr);
    } else {
      signed?.forEach((s, i) => {
        if (s.signedUrl) mapPathToUrl.set(paths[i], s.signedUrl);
      });
    }
  }

  // 3) normalizar y añadir image_url firmada
  const mapped = (products ?? []).map((p) => ({
    ...p,
    // p.category puede venir como objeto o array => extraemos el .name
    category: Array.isArray(p.category)
      ? p.category[0]?.name ?? null
      : (p as any).category?.name ?? (p as any).category ?? null,
    image_url: p.image_path ? mapPathToUrl.get(p.image_path) ?? null : null,
  }));

  return <Products products={mapped as any} />;
}

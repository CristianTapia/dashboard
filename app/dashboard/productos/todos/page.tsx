import Products from "@/app/ui/Products";
import { createServer } from "@/app/lib/supabase/Server";
import { createSupabaseAdmin } from "@/app/lib/supabase/Admin";

export default async function AllProductsPage() {
  // [GET] TRAER PRODUCTOS DIRECTAMENTE DESDE LA BD
  const supabase = await createServer();
  // 1) Categorias - Leer datos con anon (SSR)
  const { data: categories = [], error: catError } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (catError) {
    console.error("Error en Supabase:", catError);
    return <div>Error cargando datos</div>;
  }

  // 2) Productos - Leer datos
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, stock, description, category:categories(id, name), image_path")
    .order("id", { ascending: true });

  if (error) throw error;

  // 2.1) firmar imágenes (server only)
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

  // 2.2) normalizar y añadir image_url firmada
  const mapped = (products ?? []).map((p) => ({
    ...p,
    // p.category puede venir como objeto o array => extraemos el .name
    // category: Array.isArray(p.category)
    //   ? p.category[0]?.name ?? null
    //   : (p as any).category?.name ?? (p as any).category ?? null,
    image_url: p.image_path ? mapPathToUrl.get(p.image_path) ?? null : null,
  }));

  return <Products products={mapped as any} initialCategories={categories as any} />;
}

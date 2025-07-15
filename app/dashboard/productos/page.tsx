import Products from "@/app/ui/Products";

export default async function ProductsView() {
  const base = process.env.NEXT_PUBLIC_BASE_URL!;
  const res = await fetch(`${base}/api/products`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`Error cargando productos: ${res.status}`);
  const products = await res.json();
  return <Products products={products} />;
}

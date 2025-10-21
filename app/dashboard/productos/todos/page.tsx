// app/dashboard/productos/todos/page.tsx
import ProductsClient from "@/app/ui/ProductsClient";
import { listProductsWithSigned } from "@/app/lib/data/products";
import { listCategories } from "@/app/lib/data/categories";

export const revalidate = 60;

export default async function AllProductsPage() {
  const [products, categories] = await Promise.all([
    listProductsWithSigned({ limit: 50, expires: 3600 }), // firma en lote
    listCategories(),
  ]);

  return <ProductsClient products={products as any} initialCategories={categories as any} />;
}

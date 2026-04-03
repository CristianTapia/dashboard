// app/dashboard/productos/todos/page.tsx
import ProductsClient from "@/app/ui/ProductsClient";
import { listProductsWithSigned } from "@/app/lib/data/products";
import { listCategories } from "@/app/lib/data/categories";
import { listSelectableTenants } from "@/app/lib/data/tenants";

// Necesitamos cookies/sesión por tenant => deshabilita caché estática
export const dynamic = "force-dynamic";

const INITIAL_PRODUCTS_LIMIT = 20;

export default async function AllProductsPage() {
  const [products, categories, tenantCtx] = await Promise.all([
    listProductsWithSigned({ limit: INITIAL_PRODUCTS_LIMIT, expires: 3600 }),
    listCategories(),
    listSelectableTenants(),
  ]);

  return (
    <ProductsClient
      products={products}
      categories={categories}
      tenants={tenantCtx.tenants}
      isAdmin={tenantCtx.isAdmin}
      activeTenantId={tenantCtx.activeTenantId}
    />
  );
}

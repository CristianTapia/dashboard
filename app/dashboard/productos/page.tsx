// app/dashboard/productos/todos/page.tsx
import ProductsClient from "@/app/ui/ProductsClient";
import { listProductsWithSigned } from "@/app/lib/data/products";
import { listCategories } from "@/app/lib/data/categories";
import { listSelectableTenants } from "@/app/lib/data/tenants";

// Necesitamos cookies/sesión por tenant => deshabilita caché estática
export const dynamic = "force-dynamic";

export default async function AllProductsPage() {
  const [products, categories, tenantCtx] = await Promise.all([
    listProductsWithSigned({ limit: 50, expires: 3600 }), // firma en lote
    listCategories(),
    listSelectableTenants(),
  ]);

  return (
    <ProductsClient
      products={products as any}
      categories={categories as any}
      tenants={tenantCtx.tenants}
      isAdmin={tenantCtx.isAdmin}
      activeTenantId={tenantCtx.activeTenantId}
    />
  );
}

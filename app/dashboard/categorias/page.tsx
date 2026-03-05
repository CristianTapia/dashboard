import { listCategories } from "@/app/lib/data";
import CategoriesClient from "@/app/ui/CategoriesClient";
import { listSelectableTenants } from "@/app/lib/data/tenants";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const [categories, tenantCtx] = await Promise.all([listCategories(), listSelectableTenants()]);

  return (
    <CategoriesClient
      categories={categories}
      tenants={tenantCtx.tenants}
      isAdmin={tenantCtx.isAdmin}
      activeTenantId={tenantCtx.activeTenantId}
    />
  );
}

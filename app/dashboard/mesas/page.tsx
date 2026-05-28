import { redirect } from "next/navigation";

import { listRestaurantTables } from "@/app/lib/data";
import { listSelectableTenants } from "@/app/lib/data/tenants";
import { getTenantAccessContext } from "@/app/lib/tenant";
import TablesClient from "@/app/ui/TablesClient";

export const dynamic = "force-dynamic";

export default async function TablesPage() {
  const access = await getTenantAccessContext();
  if (!access.isAdmin && !access.isTenantAdmin) {
    redirect("/dashboard/atencion");
  }

  const [tables, tenantCtx] = await Promise.all([listRestaurantTables(), listSelectableTenants()]);

  return (
    <TablesClient
      tables={tables}
      tenants={tenantCtx.tenants}
      isAdmin={tenantCtx.isAdmin}
      activeTenantId={tenantCtx.activeTenantId}
    />
  );
}

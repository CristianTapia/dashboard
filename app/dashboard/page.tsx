import { redirect } from "next/navigation";

import { getTenantAccessContext } from "@/app/lib/tenant";

export default async function DashboardPage() {
  const { isAdmin } = await getTenantAccessContext();
  redirect(isAdmin ? "/dashboard/resumen" : "/dashboard/destacados");
}

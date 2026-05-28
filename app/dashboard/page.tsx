import { redirect } from "next/navigation";

import { getTenantAccessContext } from "@/app/lib/tenant";

export default async function DashboardPage() {
  const { isAdmin, isTenantAdmin } = await getTenantAccessContext();

  if (isAdmin) redirect("/dashboard/resumen");
  if (isTenantAdmin) redirect("/dashboard/destacados");

  redirect("/dashboard/atencion");
}

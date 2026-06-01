import { redirect } from "next/navigation";

import { listActiveJoinedTableSessions, listJoinableRestaurantTables } from "@/app/lib/data/table-sessions";
import { getTenantAccessContext } from "@/app/lib/tenant";
import JoinTablesClient from "@/app/ui/JoinTablesClient";

export const dynamic = "force-dynamic";

export default async function JoinTablesPage() {
  const tenantCtx = await getTenantAccessContext();
  if (tenantCtx.activeRole !== "tenant_admin" && tenantCtx.activeRole !== "staff") {
    redirect("/dashboard/resumen");
  }

  const [tables, activeSessions] = await Promise.all([
    listJoinableRestaurantTables(tenantCtx.activeTenantId),
    listActiveJoinedTableSessions(tenantCtx.activeTenantId),
  ]);

  return <JoinTablesClient tables={tables} activeSessions={activeSessions} />;
}

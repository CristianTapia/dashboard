import { listAttentionTables, listRecentlyHandledAttentionTables } from "@/app/lib/data/attention";
import { getCurrentTenantId } from "@/app/lib/tenant";
import AttentionClient from "@/app/ui/AttentionClient";

export const dynamic = "force-dynamic";

export default async function AttentionPage() {
  const [salonGroups, tenantId, recentlyHandled] = await Promise.all([
    listAttentionTables(),
    getCurrentTenantId(),
    listRecentlyHandledAttentionTables(),
  ]);

  return <AttentionClient salonGroups={salonGroups} tenantId={tenantId} recentlyHandled={recentlyHandled} />;
}

import { listAttentionTables } from "@/app/lib/data/attention";
import { getCurrentTenantId } from "@/app/lib/tenant";
import AttentionClient from "@/app/ui/AttentionClient";

export const dynamic = "force-dynamic";

export default async function AttentionPage() {
  const [salonGroups, tenantId] = await Promise.all([listAttentionTables(), getCurrentTenantId()]);

  return <AttentionClient salonGroups={salonGroups} tenantId={tenantId} />;
}

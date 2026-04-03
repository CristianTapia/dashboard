import AllHighlights from "@/app/ui/HighlightsClient";
import { listHighlightsWithSigned } from "@/app/lib/data/highlights";
import { listSelectableTenants } from "@/app/lib/data/tenants";

export const dynamic = "force-dynamic";

const INITIAL_HIGHLIGHTS_LIMIT = 20;

export default async function HighlightsPage() {
  const [highlights, tenantCtx] = await Promise.all([
    listHighlightsWithSigned({ limit: INITIAL_HIGHLIGHTS_LIMIT, expires: 3600 }),
    listSelectableTenants(),
  ]);
  return (
    <AllHighlights
      highlights={highlights}
      tenants={tenantCtx.tenants}
      isAdmin={tenantCtx.isAdmin}
      activeTenantId={tenantCtx.activeTenantId}
    />
  );
}

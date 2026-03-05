import AllHighlights from "@/app/ui/HighlightsClient";
import { listHighlightsWithSigned } from "@/app/lib/data/highlights";
import { listSelectableTenants } from "@/app/lib/data/tenants";

export const dynamic = "force-dynamic";

export default async function HighlightsPage() {
  const [highlights, tenantCtx] = await Promise.all([listHighlightsWithSigned({ limit: 50, expires: 3600 }), listSelectableTenants()]);
  return (
    <AllHighlights
      highlights={highlights}
      tenants={tenantCtx.tenants}
      isAdmin={tenantCtx.isAdmin}
      activeTenantId={tenantCtx.activeTenantId}
    />
  );
}

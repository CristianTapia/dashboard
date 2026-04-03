import "server-only";
import { createAdmin } from "@/app/lib/supabase";
import { getTenantAccessContext } from "@/app/lib/tenant";
import { TenantOption } from "@/app/lib/validators/types";
import { unstable_cache } from "next/cache";

const listAllTenantsCached = unstable_cache(
  async () => {
    const admin = createAdmin();
    const { data, error } = await admin.from("tenants").select("id,name").order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as TenantOption[];
  },
  ["tenants:all"],
  { tags: ["tenants"], revalidate: 300 },
);

export async function listSelectableTenants() {
  const { isAdmin, activeTenantId, memberships } = await getTenantAccessContext();

  if (isAdmin) {
    return {
      isAdmin,
      activeTenantId,
      tenants: await listAllTenantsCached(),
    };
  }

  const tenants = Array.from(
    new Map(
      memberships
        .filter((membership) => membership.tenant)
        .map((membership) => [membership.tenant_id, { id: membership.tenant_id, name: membership.tenant!.name }]),
    ).values(),
  ).sort((a, b) => a.name.localeCompare(b.name));

  return { isAdmin, activeTenantId, tenants };
}

import "server-only";
import { createAdmin } from "@/app/lib/supabase";
import { signPaths } from "@/app/lib/data/images";

type TenantRow = {
  id: string;
  name: string;
  domain: string | null;
};

export async function resolveTenantByPublicKey(tenantKey: string) {
  const admin = createAdmin();

  const { data: byDomain, error: byDomainError } = await admin
    .from("tenants")
    .select("id,name,domain")
    .eq("domain", tenantKey)
    .maybeSingle<TenantRow>();

  if (byDomainError) throw new Error(byDomainError.message);
  if (byDomain) return byDomain;

  const { data: byId, error: byIdError } = await admin
    .from("tenants")
    .select("id,name,domain")
    .eq("id", tenantKey)
    .maybeSingle<TenantRow>();

  if (byIdError) throw new Error(byIdError.message);
  return byId ?? null;
}

export async function listPublicProductsByTenant(tenantId: string, { limit = 100 }: { limit?: number } = {}) {
  const admin = createAdmin();

  const { data, error } = await admin
    .from("products")
    .select("id,name,price,stock,description,image_path,created_at,category:categories(id,name)")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  const products = data ?? [];
  const paths = products.map((p) => p.image_path).filter((x): x is string => !!x);
  const urlMap = await signPaths(paths, 3600);

  return products.map((p) => ({
    ...p,
    image_url: p.image_path ? urlMap.get(p.image_path) ?? null : null,
  }));
}

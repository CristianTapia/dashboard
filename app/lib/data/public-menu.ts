import "server-only";
import { createAdmin } from "@/app/lib/supabase";
import { signPaths } from "@/app/lib/data/images";

type TenantRow = {
  id: string;
  name: string;
  domain: string | null;
  menu_themes_enabled?: boolean | null;
  menu_theme?: string | null;
};

type CategoryShape = { id: number; name: string };
type ProductRow = {
  id: number;
  name: string;
  price: number;
  active: boolean | null;
  description: string | null;
  image_path: string | null;
  created_at: string;
  category: CategoryShape | CategoryShape[] | null;
};

export async function resolveTenantByPublicKey(tenantKey: string) {
  const admin = createAdmin();

  const tenantSelect = "id,name,domain,menu_themes_enabled,menu_theme";
  const fallbackSelect = "id,name,domain";
  const isMissingMenuThemeColumn = (message: string) =>
    ["menu_themes_enabled", "menu_theme"].some((column) => message.includes(column));

  const selectTenant = async (column: "domain" | "id", value: string) => {
    const { data, error } = await admin
      .from("tenants")
      .select(tenantSelect)
      .eq(column, value)
      .maybeSingle<TenantRow>();

    if (!error) return data;
    if (!isMissingMenuThemeColumn(error.message)) throw new Error(error.message);

    const { data: fallbackData, error: fallbackError } = await admin
      .from("tenants")
      .select(fallbackSelect)
      .eq(column, value)
      .maybeSingle<TenantRow>();

    if (fallbackError) throw new Error(fallbackError.message);
    return fallbackData;
  };

  const byDomain = await selectTenant("domain", tenantKey);
  if (byDomain) return byDomain;

  return (await selectTenant("id", tenantKey)) ?? null;
}

export async function listPublicProductsByTenant(
  tenantId: string,
  { limit = 100, offset = 0 }: { limit?: number; offset?: number } = {}
) {
  const admin = createAdmin();

  const { data, error } = await admin
    .from("products")
    .select("id,name,price,active,description,image_path,created_at,category:categories(id,name)")
    .eq("tenant_id", tenantId)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);

  const products = (data ?? []) as ProductRow[];
  const paths = products.map((p) => p.image_path).filter((x): x is string => !!x);
  const urlMap = await signPaths(paths, 3600);

  return products.map((p) => {
    const categoryValue = Array.isArray(p.category) ? p.category[0] ?? null : p.category;
    return {
      id: p.id,
      name: p.name,
      price: p.price,
      active: p.active ?? true,
      description: p.description,
      created_at: p.created_at,
      category: categoryValue ? { id: categoryValue.id, name: categoryValue.name } : null,
      image_url: p.image_path ? urlMap.get(p.image_path) ?? null : null,
    };
  });
}

export async function listPublicCategoriesByTenant(tenantId: string) {
  const admin = createAdmin();
  const { data, error } = await admin
    .from("categories")
    .select("id,name")
    .eq("tenant_id", tenantId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listPublicHighlightsByTenant(tenantId: string, { limit = 100, offset = 0 }: { limit?: number; offset?: number } = {}) {
  const admin = createAdmin();
  const { data, error } = await admin
    .from("highlights")
    .select("id,description,active,image_path,created_at")
    .eq("tenant_id", tenantId)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);
  const highlights = data ?? [];
  const paths = highlights.map((h) => h.image_path).filter((x): x is string => !!x);
  const urlMap = await signPaths(paths, 3600);

  return highlights.map((h) => ({
    id: h.id,
    description: h.description,
    active: h.active ?? true,
    created_at: h.created_at,
    image_url: h.image_path ? urlMap.get(h.image_path) ?? null : null,
  }));
}

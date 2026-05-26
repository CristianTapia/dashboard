import "server-only";

import { createAdmin } from "@/app/lib/supabase";

async function countRows(table: string, filters: Record<string, unknown> = {}) {
  const admin = createAdmin();
  let query = admin.from(table).select("*", { count: "exact", head: true });

  for (const [key, value] of Object.entries(filters)) {
    query = query.eq(key, value);
  }

  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function getAdminSummary() {
  const [totalTenants, activeTenants, inactiveTenants, products, categories, highlights, activeHighlights, tables] =
    await Promise.all([
      countRows("tenants"),
      countRows("tenants", { active: true }),
      countRows("tenants", { active: false }),
      countRows("products"),
      countRows("categories"),
      countRows("highlights"),
      countRows("highlights", { active: true }),
      countRows("restaurant_tables"),
    ]);

  return {
    totalTenants,
    activeTenants,
    inactiveTenants,
    products,
    categories,
    highlights,
    activeHighlights,
    inactiveHighlights: Math.max(0, highlights - activeHighlights),
    tables,
  };
}

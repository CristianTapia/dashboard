import { notFound, redirect } from "next/navigation";

import { resolvePublicTableByToken } from "@/app/lib/data/public-tables";

export const dynamic = "force-dynamic";

export default async function PublicTableShortcutPage({ params }: { params: Promise<{ tableToken: string }> }) {
  const { tableToken } = await params;

  let token: string;
  try {
    token = decodeURIComponent(tableToken);
  } catch {
    notFound();
  }

  const tableData = await resolvePublicTableByToken(token);
  if (!tableData) notFound();

  const tenantKey = tableData.tenant.domain?.trim() || tableData.tenant.id;
  redirect(`/menu/${encodeURIComponent(tenantKey)}/${encodeURIComponent(tableData.table.public_token)}`);
}

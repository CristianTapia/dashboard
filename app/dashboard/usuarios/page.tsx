import UsersClient from "@/app/ui/UsersClient";
import TenantTeamClient from "@/app/ui/TenantTeamClient";
import { listTenantTeam, listUsers } from "@/app/lib/data/users";
import { listRestaurantTables } from "@/app/lib/data";
import { requireUser } from "@/app/lib/auth";
import { getTenantAccessContext } from "@/app/lib/tenant";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await requireUser();
  const tenantCtx = await getTenantAccessContext();

  if (!tenantCtx.isAdmin && tenantCtx.isTenantAdmin) {
    const [team, tables] = await Promise.all([listTenantTeam(), listRestaurantTables()]);
    return <TenantTeamClient initialTeam={team} tables={tables} />;
  }

  if (!tenantCtx.isAdmin) {
    throw new Error("Permisos insuficientes");
  }

  const users = await listUsers();
  return <UsersClient initialUsers={users} />;
}

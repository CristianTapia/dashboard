import "server-only";
import { createServer } from "@/app/lib/supabase/server";
import { createAdmin } from "@/app/lib/supabase";
import { getCurrentTenantId, isCurrentUserAdmin } from "@/app/lib/tenant";
import { TenantOption } from "@/app/lib/validators/types";

type TenantMembershipRow = {
  tenant_id: string;
  tenants: {
    id: string;
    name: string;
  } | null;
};

export async function listSelectableTenants() {
  const supabase = await createServer();
  const isAdmin = await isCurrentUserAdmin();
  const activeTenantId = await getCurrentTenantId();

  if (isAdmin) {
    const admin = createAdmin();
    const { data, error } = await admin.from("tenants").select("id,name").order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return {
      isAdmin,
      activeTenantId,
      tenants: (data ?? []) as TenantOption[],
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Sesion no valida");

  const { data, error } = await supabase
    .from("tenant_members")
    .select("tenant_id, tenants:tenant_id(id,name)")
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  const memberships = (data ?? []) as TenantMembershipRow[];
  const tenants: TenantOption[] = memberships
    .map((row) => row.tenants)
    .filter((t): t is { id: string; name: string } => !!t?.id && !!t?.name)
    .map((t) => ({ id: t.id, name: t.name }));

  return { isAdmin, activeTenantId, tenants };
}

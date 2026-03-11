import "server-only";
import { createAdmin } from "@/app/lib/supabase";
import { createServer } from "@/app/lib/supabase/server";
import { CreateHighlightInput, UpdateHighlightInput } from "@/app/lib/validators";
import { signPaths } from "@/app/lib/data/images";
import { getCurrentTenantId, isCurrentUserAdmin, resolveWritableTenantId } from "@/app/lib/tenant";
import type { Highlight } from "@/app/lib/validators/types";

type TenantShape = { id: string; name: string };
type HighlightRow = {
  id: number;
  description: string;
  image_path: string | null;
  tenant_id: string | null;
  tenant: TenantShape | TenantShape[] | null;
};

export async function listHighlights({ limit = 20, offset = 0 }: { limit?: number; offset?: number } = {}) {
  const isAdmin = await isCurrentUserAdmin();
  const tenantId = isAdmin ? null : await getCurrentTenantId();
  const db = isAdmin ? createAdmin() : await createServer();

  let query = db
    .from("highlights")
    .select("id,description,image_path,created_at,tenant_id,tenant:tenants(id,name)")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as HighlightRow[];

  return rows.map((row): Highlight => {
    const tenantValue = Array.isArray(row.tenant) ? row.tenant[0] ?? null : row.tenant ?? null;
    return {
      id: row.id,
      description: row.description,
      image_path: row.image_path,
      tenant_id: row.tenant_id,
      tenant: tenantValue ? { id: tenantValue.id, name: tenantValue.name } : null,
    };
  });
}

export async function listHighlightsWithSigned({
  limit = 20,
  offset = 0,
  expires = 3600,
}: { limit?: number; offset?: number; expires?: number } = {}) {
  const items = await listHighlights({ limit, offset });
  const paths = items.map((p) => p.image_path).filter((x): x is string => !!x);
  const urlMap = await signPaths(paths, expires);

  return items.map((p) => ({
    ...p,
    image_url: p.image_path ? urlMap.get(p.image_path) ?? null : null,
  }));
}

export async function createHighlight(input: CreateHighlightInput, requestedTenantId?: string) {
  const supabase = await createServer();
  const tenantId = await resolveWritableTenantId(requestedTenantId);
  const adminWrite = await isCurrentUserAdmin();
  const db = adminWrite ? createAdmin() : supabase;

  const { data, error } = await db
    .from("highlights")
    .insert({ ...input, tenant_id: tenantId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateHighlight(id: number, input: UpdateHighlightInput) {
  const isAdmin = await isCurrentUserAdmin();
  const tenantId = isAdmin ? null : await getCurrentTenantId();
  const db = isAdmin ? createAdmin() : await createServer();

  let query = db.from("highlights").update(input).eq("id", id);
  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  }

  const { data, error } = await query.select().maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Destacado no encontrado o sin permisos");
  return data;
}

const IMAGE_BUCKET = process.env.SB_BUCKET_NAME ?? "images";

export async function deleteHighlight(id: number) {
  const isAdmin = await isCurrentUserAdmin();
  const tenantId = isAdmin ? null : await getCurrentTenantId();
  const db = isAdmin ? createAdmin() : await createServer();

  let query = db.from("highlights").delete().eq("id", id);
  if (tenantId) {
    query = query.eq("tenant_id", tenantId);
  }

  const { data, error } = await query.select("id, image_path").maybeSingle<{ id: number; image_path: string | null }>();
  if (error) throw new Error(error.message);

  if (!data) {
    return { ok: true };
  }

  if (data.image_path) {
    const admin = createAdmin();
    const { error: storageError } = await admin.storage.from(IMAGE_BUCKET).remove([data.image_path]);
    if (storageError) {
      console.error("deleteHighlight storage error:", storageError);
      throw new Error("Destacado eliminado pero no se pudo eliminar la imagen asociada");
    }
  }

  return { ok: true };
}

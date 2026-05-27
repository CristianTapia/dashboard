import "server-only";

import { revalidateTag } from "next/cache";

import { createAdmin } from "@/app/lib/supabase";
import { getCurrentTenantId } from "@/app/lib/tenant";
import { MenuTheme, normalizeMenuTheme } from "@/app/lib/menu-themes";

export async function getTenantMenuThemeSettings(tenantId: string) {
  const admin = createAdmin();
  const { data, error } = await admin
    .from("tenants")
    .select("id,name,menu_themes_enabled,menu_theme")
    .eq("id", tenantId)
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id as string,
    name: data.name as string,
    menuThemesEnabled: Boolean(data.menu_themes_enabled),
    menuTheme: normalizeMenuTheme(data.menu_theme as string | null),
  };
}

export async function getCurrentTenantMenuThemeSettings() {
  const tenantId = await getCurrentTenantId();
  return getTenantMenuThemeSettings(tenantId);
}

export async function updateTenantMenuThemesEnabled(tenantId: string, enabled: boolean) {
  const admin = createAdmin();
  const { data, error } = await admin
    .from("tenants")
    .update({ menu_themes_enabled: enabled })
    .eq("id", tenantId)
    .select("id,menu_themes_enabled,menu_theme")
    .single();

  if (error) throw new Error(error.message);
  revalidateTag("users");
  revalidateTag("tenants");
  return {
    id: data.id as string,
    menuThemesEnabled: Boolean(data.menu_themes_enabled),
    menuTheme: normalizeMenuTheme(data.menu_theme as string | null),
  };
}

export async function updateCurrentTenantMenuTheme(theme: MenuTheme) {
  const tenantId = await getCurrentTenantId();
  const settings = await getTenantMenuThemeSettings(tenantId);

  if (!settings.menuThemesEnabled) {
    throw new Error("Themes no esta habilitado para este tenant");
  }

  const admin = createAdmin();
  const { data, error } = await admin
    .from("tenants")
    .update({ menu_theme: theme })
    .eq("id", tenantId)
    .select("id,menu_themes_enabled,menu_theme")
    .single();

  if (error) throw new Error(error.message);
  revalidateTag("tenants");
  return {
    id: data.id as string,
    menuThemesEnabled: Boolean(data.menu_themes_enabled),
    menuTheme: normalizeMenuTheme(data.menu_theme as string | null),
  };
}

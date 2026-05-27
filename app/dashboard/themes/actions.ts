"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin, requireUser } from "@/app/lib/auth";
import { updateCurrentTenantMenuTheme, updateTenantMenuThemesEnabled } from "@/app/lib/data/menu-themes";
import { MenuThemeSchema } from "@/app/lib/validators/users";

export async function updateTenantMenuThemesEnabledAction(tenantId: string, enabled: boolean) {
  await requireAdmin();
  const updated = await updateTenantMenuThemesEnabled(tenantId, enabled);
  revalidatePath("/dashboard/usuarios");
  revalidatePath("/dashboard/themes");
  return { ok: true, updated };
}

export async function updateCurrentTenantMenuThemeAction(theme: unknown) {
  await requireUser();
  const parsed = MenuThemeSchema.safeParse(theme);
  if (!parsed.success) throw new Error("Theme invalido");

  const updated = await updateCurrentTenantMenuTheme(parsed.data);
  revalidatePath("/dashboard/themes");
  return { ok: true, updated };
}

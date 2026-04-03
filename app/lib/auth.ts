import "server-only";
import { getCurrentUser, isCurrentUserAdmin } from "@/app/lib/tenant";
import { redirect } from "next/navigation";

export async function getCurrentUserOptional() {
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}

export async function requireUser() {
  return getCurrentUser();
}

export async function requireUserRedirect(nextPath = "/dashboard") {
  try {
    return await getCurrentUser();
  } catch {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
}

export async function requireAdmin() {
  await getCurrentUser();
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) throw new Error("Permisos insuficientes");
  return { ok: true };
}

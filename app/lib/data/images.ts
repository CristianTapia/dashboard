import "server-only";
import { createAdmin } from "@/app/lib/supabase";

export async function signPaths(paths: string[], expires = 3600) {
  const admin = createAdmin();
  if (!paths.length) return new Map<string, string>();
  const { data, error } = await admin.storage.from("images").createSignedUrls(paths, expires);
  if (error) throw new Error(error.message);

  const map = new Map<string, string>();
  data?.forEach((signed, index) => {
    if (signed.signedUrl) {
      map.set(paths[index], signed.signedUrl);
    }
  });
  return map;
}

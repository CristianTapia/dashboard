import { z } from "zod";

const ALLOWED_SIGNED_PREFIXES = ["products/", "highlights/"] as const;
const ALLOWED_UPLOAD_FOLDERS = ["products", "highlights", "banners"] as const;
const ALLOWED_UPLOAD_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"] as const;

export const SignedUrlRequestSchema = z.object({
  path: z
    .string()
    .trim()
    .min(1, "path requerido")
    .refine(
      (value) => !value.includes("..") && ALLOWED_SIGNED_PREFIXES.some((prefix) => value.startsWith(prefix)),
      "path invalido",
    ),
  expires: z.coerce.number().int().min(60).max(60 * 60 * 24).default(3600),
});

export const UploadFolderSchema = z
  .string()
  .trim()
  .optional()
  .transform((raw) => {
    const base = raw ?? "products";
    const clean = base.replace(/^\/+|\/+$/g, "").replace(/[^a-z0-9/_-]/gi, "");
    const root = (clean.split("/")[0] || "products").toLowerCase();
    if (!ALLOWED_UPLOAD_FOLDERS.includes(root as (typeof ALLOWED_UPLOAD_FOLDERS)[number])) return "products";
    return clean || "products";
  });

export const UploadFileExtensionSchema = z
  .string()
  .trim()
  .toLowerCase()
  .refine(
    (ext) => ALLOWED_UPLOAD_EXTENSIONS.includes(ext as (typeof ALLOWED_UPLOAD_EXTENSIONS)[number]),
    "Extension no permitida",
  );

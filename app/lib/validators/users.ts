import { z } from "zod";

const TenantDomainSchema = z
  .string()
  .trim()
  .min(1, "La clave publica es obligatoria")
  .max(60, "La clave publica es demasiado larga")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "La clave publica solo permite minusculas, numeros y guiones");

const LoginNameSchema = z
  .string()
  .trim()
  .min(3, "El nombre de acceso debe tener al menos 3 caracteres")
  .max(60, "El nombre de acceso es demasiado largo")
  .regex(/^[\p{L}\p{N}._-]+$/u, "El nombre de acceso solo permite letras, numeros, puntos, guiones y guion bajo");

export const CreateUserSchema = z.object({
  tenantName: z.string().min(1, "El nombre del local es obligatorio"),
  tenantDomain: TenantDomainSchema.optional(),
  tenantAddress: z.string().trim().max(240, "La direccion es demasiado larga").optional(),
  tenantMapsUrl: z.string().trim().url("El link de Maps no es valido").optional(),
  loginName: LoginNameSchema,
  email: z.string().email("Correo invalido"),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres"),
  role: z.enum(["admin", "member"]).optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  tenantName: z.string().min(1).optional(),
  tenantDomain: TenantDomainSchema.optional(),
  tenantAddress: z.string().trim().max(240, "La direccion es demasiado larga").optional(),
  tenantMapsUrl: z.string().trim().url("El link de Maps no es valido").optional(),
  loginName: LoginNameSchema.optional(),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres").optional(),
  role: z.enum(["admin", "member"]).optional(),
  userId: z.string().min(1).optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

import { z } from "zod";

export const CreateUserSchema = z.object({
  tenantName: z.string().min(1, "El nombre del local es obligatorio"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["owner", "admin", "member"]).optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  tenantName: z.string().min(1).optional(),
});
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

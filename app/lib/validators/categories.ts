import { z } from "zod";

// Esquema base de Category (como está en la BD)
export const CreateCategorySchema = z.object({
  id: z.number().int().positive(), // asumo que es SERIAL (integer autoincrement)
  name: z.string().min(1, "El nombre es obligatorio"),
});

// Tipos inferidos de Zod
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export const UpdateCategorySchema = CreateCategorySchema.partial();
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;

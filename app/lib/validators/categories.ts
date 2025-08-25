import { z } from "zod";

// Esquema base de Category (como está en la BD)
export const CategorySchema = z.object({
  id: z.number().int().positive(), // asumo que es SERIAL (integer autoincrement)
  name: z.string().min(1, "El nombre es obligatorio"),
});

// Para crear una categoría (no necesitas id porque lo genera la BD)
export const CategoryCreateSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
});

// Para actualizar (puedes enviar solo algunos campos)
export const CategoryUpdateSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).optional(),
});

// Tipos inferidos de Zod
export type Category = z.infer<typeof CategorySchema>;
export type CategoryCreateInput = z.infer<typeof CategoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof CategoryUpdateSchema>;

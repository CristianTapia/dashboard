import { z } from "zod";

// Para crear categoría solo se requiere `name`
export const CreateCategorySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;

// Para actualizar: actualmente solo `name` opcional (si se usara en el futuro)
export const UpdateCategorySchema = z.object({
  name: z.string().min(1).optional(),
});
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;


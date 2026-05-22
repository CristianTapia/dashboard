import { z } from "zod";

export const CreateProductSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  price: z.number().min(0, "El precio no puede ser negativo"),
  description: z.string().optional(),
  category_id: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val), "ID de categoria invalido"),
  image_path: z.string().min(1).optional().nullable(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export const UpdateProductSchema = CreateProductSchema.partial();
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

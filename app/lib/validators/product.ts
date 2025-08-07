import { z } from "zod";

export const CreateProductSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  price: z.number().min(0, "El precio no puede ser negativo"),
  stock: z.number().int().min(0, "Stock inválido"),
  description: z.string().optional(),
  category_id: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val)) // <-- asegura que sea un número
    .refine((val) => !isNaN(val), "ID de categoría inválido"),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

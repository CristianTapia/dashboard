import { z } from "zod";

export const CreateProductSchema = z.object({
  description: z.string().optional(),
  image_path: z.string().min(1).optional().nullable(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

import { z } from "zod";

export const CreateHighlightSchema = z.object({
  description: z.string().min(1, "La descripción es obligatoria"),
  image_path: z.string().min(1), // path tipo "highlights/uuid.jpg"
});

export type CreateHighlightInput = z.infer<typeof CreateHighlightSchema>;
export const UpdateHighlightSchema = CreateHighlightSchema.partial().extend({
  image_path: z.string().min(1).nullable().optional(),
});
export type UpdateHighlightInput = z.infer<typeof UpdateHighlightSchema>;

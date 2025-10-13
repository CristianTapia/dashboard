import { z } from "zod";

export const CreateHighlightSchema = z.object({
  description: z.string().min(1, "La descripción es obligatoria"),
  image_url: z.string().min(1).optional().nullable(), // path tipo "highlights/uuid.jpg"
});

export type CreateHighlightInput = z.infer<typeof CreateHighlightSchema>;
export const UpdateHighlightSchema = CreateHighlightSchema.partial();
export type UpdateHighlightInput = z.infer<typeof UpdateHighlightSchema>;

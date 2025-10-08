// app/lib/validators/highlights.ts
import { z } from "zod";

export const CreateHighlightSchema = z.object({
  description: z.string().min(1, "La descripción es obligatoria"),
  image_url: z.string().min(1).optional().nullable(), // path tipo "highlights/uuid.jpg"
});

export type CreateHighlightInput = z.infer<typeof CreateHighlightSchema>;

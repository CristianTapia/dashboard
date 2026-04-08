import { z } from "zod";

export const PublicTableTokenSchema = z.string().trim().min(1, "Token de mesa invalido");

export const CreatePublicTableEventSchema = z.object({
  event_type: z.string().trim().min(1).max(64),
  source: z.string().trim().min(1).max(64).optional(),
  route: z.string().trim().min(1).max(64).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type CreatePublicTableEventInput = z.infer<typeof CreatePublicTableEventSchema>;

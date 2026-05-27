import { z } from "zod";

const OptionalTrimmedText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : undefined))
  .optional();

const OptionalTableNumber = z
  .string()
  .trim()
  .regex(/^\d*$/, "El numero de mesa solo puede contener numeros")
  .transform((value) => (value.length > 0 ? value : undefined))
  .optional();

export const CreateRestaurantTableSchema = z.object({
  name: OptionalTrimmedText,
  number: OptionalTableNumber,
  salon: OptionalTrimmedText,
  active: z.boolean().optional(),
  tenant_id: z.string().min(1).optional(),
});

export type CreateRestaurantTableInput = z.infer<typeof CreateRestaurantTableSchema>;

export const UpdateRestaurantTableSchema = z
  .object({
    name: OptionalTrimmedText,
    number: OptionalTableNumber,
    salon: OptionalTrimmedText,
  })
  .refine((data) => Boolean(data.name || data.number || data.salon), {
    message: "Debes indicar un nombre, numero o salon de mesa",
  });

export type UpdateRestaurantTableInput = z.infer<typeof UpdateRestaurantTableSchema>;

export const UpdateRestaurantTableActiveSchema = z.object({
  active: z.boolean(),
});

export type UpdateRestaurantTableActiveInput = z.infer<typeof UpdateRestaurantTableActiveSchema>;

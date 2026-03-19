import { z } from "zod";

export const profileSchema = z.object({
  full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  currency: z.string().length(3, "Código de moneda inválido"),
  timezone: z.string().min(1, "La zona horaria es requerida"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

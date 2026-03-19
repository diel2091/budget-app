import { z } from "zod";

export const subscriptionSchema = z.object({
  category_id: z.string().uuid("Categoría inválida"),
  name: z.string().min(1, "El nombre es requerido").max(100),
  description: z.string().max(500).optional(),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  currency: z.string().length(3).default("USD"),
  billing_cycle: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]),
  billing_day: z.coerce.number().int().min(1).max(31).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de inicio inválida"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de fin inválida").optional().or(z.literal("")),
  status: z.enum(["active", "paused", "cancelled"]).default("active"),
  url: z.string().url().optional().or(z.literal("")),
  logo_url: z.string().url().optional().or(z.literal("")),
  alert_days_before: z.coerce.number().int().min(1).max(30).default(3),
  auto_renews: z.boolean().default(true),
  notes: z.string().max(1000).optional(),
});

export type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

export const updateSubscriptionSchema = subscriptionSchema.extend({
  id: z.string().uuid(),
});

export type UpdateSubscriptionFormData = z.infer<typeof updateSubscriptionSchema>;

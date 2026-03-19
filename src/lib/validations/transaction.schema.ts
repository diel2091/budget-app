import { z } from "zod";

export const transactionSchema = z.object({
  category_id: z.string().uuid("Categoría inválida"),
  type: z.enum(["expense", "income"]),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  currency: z.string().length(3).default("USD"),
  description: z.string().max(255).optional(),
  notes: z.string().max(1000).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida").default(() => {
    return new Date().toISOString().split("T")[0];
  }),
  is_recurring: z.boolean().default(false),
  subscription_id: z.string().uuid().nullable().optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

export const updateTransactionSchema = transactionSchema.extend({
  id: z.string().uuid(),
});

export type UpdateTransactionFormData = z.infer<typeof updateTransactionSchema>;

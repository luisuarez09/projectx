import { z } from "zod";

export const estimateItemSchema = z.object({
  description: z.string().min(1, "Requerido"),
  qty: z.coerce.number().positive("Mayor a 0"),
  unit: z.string().optional(),
  unitPrice: z.coerce.number().nonnegative("No negativo"),
});

export const estimateSchema = z.object({
  clientId: z.coerce.number().int().positive(),
  date: z.string().optional(),
  currency: z.enum(["USD", "VES"]).default("USD"),
  exchangeRate: z.coerce.number().positive().optional().nullable(),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  discountRate: z.coerce.number().min(0).max(100).default(0),
  notes: z.string().optional(),
  items: z.array(estimateItemSchema).min(1, "Agrega al menos un concepto"),
});
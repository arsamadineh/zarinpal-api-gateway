import { z } from 'zod';

export const CardSchema = z.object({
  id: z.string(),
  cardNumber: z.string(),
  expiryDate: z.string(),
  cvv: z.string(),
});

export type Card = z.infer<typeof CardSchema>;

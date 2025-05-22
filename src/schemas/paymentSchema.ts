import { z } from 'zod';

export const PaymentRequestSchema = z.object({
  amount: z.number().min(1000), // Minimum amount of 1000 Toman
  callback_url: z.string().url(),
  description: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().email().optional(),
});

export type PaymentRequestSchema = z.infer<typeof PaymentRequestSchema>;

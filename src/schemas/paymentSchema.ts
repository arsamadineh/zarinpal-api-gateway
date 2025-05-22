import { z } from 'zod';

export const paymentSchema = z.object({
  body: z.object({
    merchantId: z.string().min(1),
    amount: z.number().gt(0),
    callbackUrl: z.string().url(),
    description: z.string().optional(),
  }),
});

export type PaymentRequest = z.infer<typeof paymentSchema>;

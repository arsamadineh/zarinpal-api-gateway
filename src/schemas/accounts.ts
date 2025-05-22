import { z } from 'zod';

export const AccountSchema = z.object({
  id: z.string(),
  accountNumber: z.string(),
  balance: z.number(),
  currency: z.string(),
});

export type Account = z.infer<typeof AccountSchema>;

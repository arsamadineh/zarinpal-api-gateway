/**
 * Zarinpal Payment Gateway - Zod Schemas
 * Runtime validation for all API operations
 */

import { z } from 'zod';

// ============= Base Schemas =============

export const AmountSchema = z
  .number()
  .min(1000, 'Amount must be at least 1,000 Rials')
  .max(50000000, 'Amount exceeds maximum limit')
  .int('Amount must be an integer');

export const AuthoritySchema = z
  .string()
  .min(10, 'Invalid authority format')
  .regex(/^[a-zA-Z0-9]{10,}$/, 'Authority contains invalid characters');

export const CallbackUrlSchema = z
  .string()
  .url('Invalid callback URL')
  .startsWith('http', 'Callback URL must start with http or https');

export const EmailSchema = z.string().email('Invalid email format').optional();

export const MobileSchema = z
  .string()
  .regex(/^09\d{9}$/, 'Invalid Iranian mobile number')
  .optional();

export const DescriptionSchema = z
  .string()
  .min(1, 'Description cannot be empty')
  .max(500, 'Description exceeds 500 characters');

export const OrderIdSchema = z
  .string()
  .max(100, 'Order ID exceeds 100 characters')
  .optional();

export const RefIdSchema = z
  .string()
  .min(5, 'Invalid ref_id format')
  .max(50, 'ref_id exceeds maximum length');

export const SettlementIdSchema = z
  .string()
  .min(5, 'Invalid settlement_id format')
  .max(50, 'settlement_id exceeds maximum length');

export const SessionIdSchema = z
  .string()
  .min(10, 'Invalid session_id format')
  .max(100, 'session_id exceeds maximum length');

export const MetadataSchema = z
  .record(z.union([z.string(), z.number()]))
  .optional();

// ============= Payment Schemas =============

export const PaymentRequestSchema = z.object({
  amount: AmountSchema,
  callback_url: CallbackUrlSchema,
  description: DescriptionSchema,
  email: EmailSchema,
  mobile: MobileSchema,
  order_id: OrderIdSchema,
  metadata: MetadataSchema,
});

export type PaymentRequest = z.infer<typeof PaymentRequestSchema>;

export const PaymentVerificationSchema = z.object({
  authority: AuthoritySchema,
  amount: AmountSchema,
});

export type PaymentVerification = z.infer<typeof PaymentVerificationSchema>;

// ============= Reversal & Refund Schemas =============

export const PaymentReversalSchema = z.object({
  authority: AuthoritySchema,
});

export type PaymentReversal = z.infer<typeof PaymentReversalSchema>;

export const RefundSchema = z.object({
  ref_id: RefIdSchema,
  amount: AmountSchema.optional(),
});

export type Refund = z.infer<typeof RefundSchema>;

// ============= Inquiry Schemas =============

export const PaymentInquirySchema = z.object({
  authority: AuthoritySchema,
  amount: AmountSchema.optional(),
});

export type PaymentInquiry = z.infer<typeof PaymentInquirySchema>;

// ============= Transaction Query Schemas =============

export const DateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD')
  .optional();

export const TransactionQuerySchema = z.object({
  ref_id: RefIdSchema.optional(),
  authority: AuthoritySchema.optional(),
  settlement_id: SettlementIdSchema.optional(),
  from_date: DateSchema,
  to_date: DateSchema,
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

export type TransactionQuery = z.infer<typeof TransactionQuerySchema>;

// ============= Session & Checkout Schemas =============

export const SessionValidationSchema = z.object({
  session_id: SessionIdSchema,
});

export type SessionValidation = z.infer<typeof SessionValidationSchema>;

export const CheckoutItemSchema = z.object({
  id: z.string().max(100),
  name: z.string().max(255),
  price: AmountSchema,
  quantity: z.number().int().positive(),
  currency: z.string().length(3).optional(),
});

export const CustomerInfoSchema = z.object({
  email: EmailSchema,
  mobile: MobileSchema,
  name: z.string().max(255).optional(),
  national_id: z.string().max(20).optional(),
});

export const CheckoutSessionSchema = z.object({
  amount: AmountSchema,
  currency: z.string().length(3).optional().default('IRR'),
  items: z.array(CheckoutItemSchema).optional(),
  customer: CustomerInfoSchema.optional(),
  metadata: MetadataSchema,
});

export type CheckoutSession = z.infer<typeof CheckoutSessionSchema>;

// ============= Error Handling Schemas =============

export const ErrorResponseSchema = z.object({
  code: z.union([z.string(), z.number()]),
  message: z.string(),
  details: z.unknown().optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// ============= Safe Parse Helper =============

export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError['errors'] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error.errors };
}

/**
 * Zarinpal Payment Gateway - Type Definitions
 * Complete type safety for all Zarinpal API operations
 */

export type PaymentStatus =
  | 'paid'
  | 'canceled'
  | 'error'
  | 'pending'
  | 'verification_required';

export type RefundStatus =
  | 'success'
  | 'failed'
  | 'invalid_refund_amount'
  | 'invalid_transaction'
  | 'merchant_operation_failed';

export type SettlementStatus =
  | 'settlement_ok'
  | 'settlement_pending'
  | 'settlement_failed'
  | 'no_settlement'
  | 'settlement_na';

// ============= Payment Request & Response =============

export interface PaymentRequestInput {
  amount: number; // Rials (minimum 1,000)
  callback_url: string;
  description: string;
  email?: string;
  mobile?: string;
  order_id?: string; // Unique order identifier
  metadata?: Record<string, string | number>;
}

export interface PaymentRequestResponse {
  authority: string;
  code: number; // 100 = success
  message?: string;
  ref_id?: string;
  fee?: number;
  fee_type?: string;
}

// ============= Payment Verification =============

export interface PaymentVerificationInput {
  authority: string;
  amount: number; // Must match original amount
}

export interface PaymentVerificationResponse {
  status: number; // 100 = verified, others = failed
  ref_id: string;
  card_hash?: string;
  card_pan?: string;
  fee?: number;
  fee_type?: string;
  transaction_id?: string;
}

// ============= Reversal & Refund =============

export interface PaymentReversalInput {
  authority: string;
}

export interface PaymentReversalResponse {
  status: number;
  ref_id?: string;
}

export interface RefundInput {
  ref_id: string;
  amount?: number; // Partial refund if less than original
}

export interface RefundResponse {
  status: number;
  ref_id: string;
  message?: string;
}

// ============= Payment Inquiry =============

export interface PaymentInquiryInput {
  authority: string;
  amount?: number;
}

export interface PaymentInquiryResponse {
  status: number;
  ref_id: string;
  card_hash?: string;
  card_pan?: string;
  total_commission?: number;
  total_commission_type?: string;
  payment_status?: string;
}

// ============= Transactions & Settlement =============

export interface TransactionQuery {
  ref_id?: string;
  authority?: string;
  settlement_id?: string;
  from_date?: string; // YYYY-MM-DD
  to_date?: string; // YYYY-MM-DD
  limit?: number;
  offset?: number;
}

export interface TransactionInfo {
  ref_id: string;
  authority: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  created_at: string;
  verified_at?: string;
  card_hash?: string;
  card_pan?: string;
}

export interface SettlementInfo {
  settlement_id: string;
  status: SettlementStatus;
  total_amount: number;
  fee: number;
  net_amount: number;
  created_at: string;
  updated_at?: string;
  transactions_count: number;
}

// ============= Merchant Terminals =============

export interface TerminalInfo {
  terminal_id: string;
  terminal_name: string;
  terminal_code: string;
  created_at: string;
  is_active: boolean;
  commission_percent?: number;
}

// ============= Session Validation & Checkout =============

export interface SessionValidationInput {
  session_id: string;
}

export interface SessionValidationResponse {
  is_valid: boolean;
  session_data?: Record<string, unknown>;
  expires_at?: string;
}

export interface CheckoutSessionInput {
  amount: number;
  currency?: string;
  items?: CheckoutItem[];
  customer?: CustomerInfo;
  metadata?: Record<string, string | number>;
}

export interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  currency?: string;
}

export interface CustomerInfo {
  email?: string;
  mobile?: string;
  name?: string;
  national_id?: string;
}

export interface CheckoutSessionResponse {
  session_id: string;
  checkout_url: string;
  expires_at: string;
}

// ============= Zarinpal Client Configuration =============

export interface ZarinpalConfig {
  merchantId: string;
  apiKey?: string;
  sandbox?: boolean;
  timeout?: number;
  retries?: number;
  logger?: Logger;
}

// ============= Logger Interface =============

export interface Logger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, error?: unknown): void;
}

// ============= Client Response Wrapper =============

export interface ClientResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string | number;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

// ============= Webhook Events =============

export type WebhookEventType = 'payment.success' | 'payment.failed' | 'refund.issued';

export interface WebhookEvent {
  event: WebhookEventType;
  timestamp: string;
  data: Record<string, unknown>;
}

// ============= Errors =============

export class ZarinpalError extends Error {
  constructor(
    public code: string | number,
    message: string,
    public statusCode: number = 400,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ZarinpalError';
  }
}

export class ValidationError extends ZarinpalError {
  constructor(message: string, details?: unknown) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends ZarinpalError {
  constructor(message: string, details?: unknown) {
    super('NETWORK_ERROR', message, 503, details);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends ZarinpalError {
  constructor(message: string = 'Invalid credentials') {
    super('AUTHENTICATION_ERROR', message, 401);
    this.name = 'AuthenticationError';
  }
}

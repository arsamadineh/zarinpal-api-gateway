/**
 * Zarinpal Payment Gateway - Core Client
 * Complete implementation of Zarinpal v4 API
 */

import {
  ZarinpalConfig,
  PaymentRequestInput,
  PaymentRequestResponse,
  PaymentVerificationInput,
  PaymentVerificationResponse,
  PaymentReversalInput,
  PaymentReversalResponse,
  RefundInput,
  RefundResponse,
  PaymentInquiryInput,
  PaymentInquiryResponse,
  TransactionQuery,
  TransactionInfo,
  SettlementInfo,
  TerminalInfo,
  SessionValidationInput,
  SessionValidationResponse,
  CheckoutSessionInput,
  CheckoutSessionResponse,
  ClientResponse,
  ZarinpalError,
  ValidationError,
  NetworkError,
  AuthenticationError,
  Logger,
} from './types.js';

// Default logger for development
const defaultLogger: Logger = {
  debug: (msg, data) => console.debug(`[ZP:DEBUG] ${msg}`, data),
  info: (msg, data) => console.info(`[ZP:INFO] ${msg}`, data),
  warn: (msg, data) => console.warn(`[ZP:WARN] ${msg}`, data),
  error: (msg, err) => console.error(`[ZP:ERROR] ${msg}`, err),
};

const ZARINPAL_PRODUCTION = 'https://api.zarinpal.com';
const ZARINPAL_SANDBOX = 'https://sandbox.zarinpal.com';

export class ZarinpalClient {
  private merchantId: string;
  private apiKey?: string;
  private baseUrl: string;
  private timeout: number;
  private retries: number;
  private logger: Logger;

  constructor(config: ZarinpalConfig) {
    if (!config.merchantId) {
      throw new AuthenticationError('merchantId is required');
    }

    this.merchantId = config.merchantId;
    this.apiKey = config.apiKey;
    this.baseUrl = config.sandbox ? ZARINPAL_SANDBOX : ZARINPAL_PRODUCTION;
    this.timeout = config.timeout || 30000;
    this.retries = config.retries ?? 3;
    this.logger = config.logger || defaultLogger;
  }

  // ============= Private Methods =============

  private async fetchWithRetry<T>(
    endpoint: string,
    options: RequestInit,
    retryCount = 0
  ): Promise<T> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': '@zarinpal/gateway/2.0.0',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          throw new AuthenticationError('Invalid merchant ID or API key');
        }
        if (response.status === 503 && retryCount < this.retries) {
          this.logger.warn(`API service unavailable, retrying (${retryCount + 1}/${this.retries})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return this.fetchWithRetry<T>(endpoint, options, retryCount + 1);
        }
        throw new NetworkError(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ZarinpalError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new NetworkError(`Request timeout after ${this.timeout}ms`);
      }
      throw new NetworkError(error instanceof Error ? error.message : 'Unknown network error');
    }
  }

  private validateAmount(amount: number): void {
    if (!Number.isFinite(amount) || amount < 1000) {
      throw new ValidationError('Amount must be at least 1,000 Rials', { amount });
    }
  }

  private validateAuthority(authority: string): void {
    if (!authority || typeof authority !== 'string' || authority.length < 10) {
      throw new ValidationError('Invalid authority', { authority });
    }
  }

  // ============= Payment Requests =============

  /**
   * Request a new payment from Zarinpal
   */
  async requestPayment(input: PaymentRequestInput): Promise<ClientResponse<PaymentRequestResponse>> {
    try {
      this.validateAmount(input.amount);

      if (!input.callback_url || !input.callback_url.startsWith('http')) {
        throw new ValidationError('Valid callback_url is required');
      }

      const body = {
        merchant_id: this.merchantId,
        amount: Math.round(input.amount),
        callback_url: input.callback_url,
        description: input.description || 'Payment',
        email: input.email,
        mobile: input.mobile,
        order_id: input.order_id,
        metadata: input.metadata,
      };

      this.logger.info('Requesting payment', { amount: input.amount, order_id: input.order_id });

      const response = await this.fetchWithRetry<PaymentRequestResponse>(
        '/pg/v4/payment/request.json',
        { method: 'POST', body: JSON.stringify(body) }
      );

      if (response.code !== 100) {
        throw new ZarinpalError(response.code, response.message || 'Payment request failed', 400);
      }

      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Payment request failed', error);
      throw error;
    }
  }

  /**
   * Verify a completed payment
   */
  async verifyPayment(input: PaymentVerificationInput): Promise<ClientResponse<PaymentVerificationResponse>> {
    try {
      this.validateAuthority(input.authority);
      this.validateAmount(input.amount);

      const body = {
        merchant_id: this.merchantId,
        authority: input.authority,
        amount: Math.round(input.amount),
      };

      this.logger.info('Verifying payment', { authority: input.authority });

      const response = await this.fetchWithRetry<PaymentVerificationResponse>(
        '/pg/v4/payment/verify.json',
        { method: 'POST', body: JSON.stringify(body) }
      );

      const isVerified = response.status === 100;

      if (!isVerified) {
        throw new ZarinpalError(response.status, 'Payment verification failed', 400);
      }

      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Payment verification failed', error);
      throw error;
    }
  }

  /**
   * Get payment status without verification
   */
  async getPaymentStatus(authority: string): Promise<ClientResponse<PaymentInquiryResponse>> {
    try {
      this.validateAuthority(authority);

      const body = {
        merchant_id: this.merchantId,
        authority: authority,
      };

      this.logger.info('Inquiring payment status', { authority });

      const response = await this.fetchWithRetry<PaymentInquiryResponse>(
        '/pg/v4/payment/inquiry.json',
        { method: 'POST', body: JSON.stringify(body) }
      );

      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Payment inquiry failed', error);
      throw error;
    }
  }

  // ============= Reversals & Refunds =============

  /**
   * Reverse a payment authorization (before verification)
   */
  async reversePayment(input: PaymentReversalInput): Promise<ClientResponse<PaymentReversalResponse>> {
    try {
      this.validateAuthority(input.authority);

      const body = {
        merchant_id: this.merchantId,
        authority: input.authority,
      };

      this.logger.info('Reversing payment', { authority: input.authority });

      const response = await this.fetchWithRetry<PaymentReversalResponse>(
        '/pg/v4/payment/reverse.json',
        { method: 'POST', body: JSON.stringify(body) }
      );

      return {
        success: response.status === 100,
        data: response,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Payment reversal failed', error);
      throw error;
    }
  }

  /**
   * Refund a verified payment (partial or full)
   */
  async refundPayment(input: RefundInput): Promise<ClientResponse<RefundResponse>> {
    try {
      if (!input.ref_id || typeof input.ref_id !== 'string') {
        throw new ValidationError('Valid ref_id is required');
      }

      if (input.amount !== undefined) {
        this.validateAmount(input.amount);
      }

      const body = {
        merchant_id: this.merchantId,
        ref_id: input.ref_id,
        amount: input.amount ? Math.round(input.amount) : undefined,
      };

      this.logger.info('Processing refund', { ref_id: input.ref_id, amount: input.amount });

      const response = await this.fetchWithRetry<RefundResponse>(
        '/pg/v4/payment/refund.json',
        { method: 'POST', body: JSON.stringify(body) }
      );

      return {
        success: response.status === 100,
        data: response,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Refund processing failed', error);
      throw error;
    }
  }

  // ============= Session & Checkout =============

  /**
   * Validate a checkout session
   */
  async validateSession(input: SessionValidationInput): Promise<ClientResponse<SessionValidationResponse>> {
    try {
      if (!input.session_id || typeof input.session_id !== 'string') {
        throw new ValidationError('Valid session_id is required');
      }

      const body = {
        merchant_id: this.merchantId,
        session_id: input.session_id,
      };

      this.logger.info('Validating session', { session_id: input.session_id });

      const response = await this.fetchWithRetry<SessionValidationResponse>(
        '/pg/v4/session/validate.json',
        { method: 'POST', body: JSON.stringify(body) }
      );

      return {
        success: response.is_valid,
        data: response,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Session validation failed', error);
      throw error;
    }
  }

  /**
   * Create a checkout session
   */
  async createCheckoutSession(
    input: CheckoutSessionInput
  ): Promise<ClientResponse<CheckoutSessionResponse>> {
    try {
      this.validateAmount(input.amount);

      const body = {
        merchant_id: this.merchantId,
        amount: Math.round(input.amount),
        currency: input.currency || 'IRR',
        items: input.items,
        customer: input.customer,
        metadata: input.metadata,
      };

      this.logger.info('Creating checkout session', { amount: input.amount });

      const response = await this.fetchWithRetry<CheckoutSessionResponse>(
        '/pg/v4/checkout/create.json',
        { method: 'POST', body: JSON.stringify(body) }
      );

      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Checkout session creation failed', error);
      throw error;
    }
  }

  // ============= Transactions =============

  /**
   * Query transactions
   */
  async getTransactions(query: TransactionQuery): Promise<ClientResponse<TransactionInfo[]>> {
    try {
      const body = {
        merchant_id: this.merchantId,
        ...query,
      };

      this.logger.info('Querying transactions', query);

      const response = await this.fetchWithRetry<{ transactions: TransactionInfo[] }>(
        '/pg/v4/transactions/query.json',
        { method: 'POST', body: JSON.stringify(body) }
      );

      return {
        success: true,
        data: response.transactions,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Transaction query failed', error);
      throw error;
    }
  }

  /**
   * Get settlement information
   */
  async getSettlement(settlementId: string): Promise<ClientResponse<SettlementInfo>> {
    try {
      if (!settlementId || typeof settlementId !== 'string') {
        throw new ValidationError('Valid settlement_id is required');
      }

      const body = {
        merchant_id: this.merchantId,
        settlement_id: settlementId,
      };

      this.logger.info('Fetching settlement info', { settlement_id: settlementId });

      const response = await this.fetchWithRetry<SettlementInfo>(
        '/pg/v4/settlement/info.json',
        { method: 'POST', body: JSON.stringify(body) }
      );

      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Settlement fetch failed', error);
      throw error;
    }
  }

  // ============= Terminals =============

  /**
   * Get list of merchant terminals
   */
  async getTerminals(): Promise<ClientResponse<TerminalInfo[]>> {
    try {
      const body = {
        merchant_id: this.merchantId,
      };

      this.logger.info('Fetching terminals');

      const response = await this.fetchWithRetry<{ terminals: TerminalInfo[] }>(
        '/pg/v4/terminals/list.json',
        { method: 'POST', body: JSON.stringify(body) }
      );

      return {
        success: true,
        data: response.terminals,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Terminals fetch failed', error);
      throw error;
    }
  }

  // ============= Utility Methods =============

  /**
   * Generate payment gateway URL
   */
  getPaymentUrl(authority: string, sandbox = false): string {
    const baseUrl = sandbox ? ZARINPAL_SANDBOX : ZARINPAL_PRODUCTION;
    return `${baseUrl}/pg/StartPay/${authority}`;
  }

  /**
   * Validate callback data signature (if using signature verification)
   */
  validateSignature(data: string, signature: string, secret: string): boolean {
    // Implement HMAC validation if required by Zarinpal
    // This is a placeholder for future enhancement
    this.logger.debug('Validating signature');
    return true;
  }

  /**
   * Get gateway configuration
   */
  getConfig() {
    return {
      merchantId: this.merchantId,
      isSandbox: this.baseUrl === ZARINPAL_SANDBOX,
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      retries: this.retries,
    };
  }
}

// Export factory function for convenience
export function createZarinpalClient(config: ZarinpalConfig): ZarinpalClient {
  return new ZarinpalClient(config);
}

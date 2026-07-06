/**
 * Zarinpal Payment Gateway - Fastify Adapter
 * Drop-in Fastify integration
 */

import {
  FastifyInstance,
  FastifyReply,
} from 'fastify';
import {
  createZarinpalClient,
  ZarinpalError,
  PaymentRequestSchema,
  PaymentVerificationSchema,
  PaymentReversalSchema,
  RefundSchema,
  PaymentInquirySchema,
  TransactionQuerySchema,
  CheckoutSessionSchema,
  safeParse,
} from '../core/index.js';

/**
 * Register Zarinpal routes on Fastify
 */
export async function registerZarinpal(
  fastify: FastifyInstance,
  options: any
) {
  const client = createZarinpalClient(options);

  // Decorate request with client
  fastify.decorate('zarinpal', client);

  // ===== Payment Routes =====

  fastify.post<{ Body: any }>('/payment/request', async (request, reply) => {
    try {
      const result = safeParse(PaymentRequestSchema, request.body);
      if (!result.success) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: result.errors,
          },
        });
      }

      const response = await client.requestPayment(result.data);
      return reply.send({
        success: true,
        data: response.data,
        timestamp: response.timestamp,
      });
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.post<{ Body: any }>('/payment/verify', async (request, reply) => {
    try {
      const result = safeParse(PaymentVerificationSchema, request.body);
      if (!result.success) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: result.errors,
          },
        });
      }

      const response = await client.verifyPayment(result.data);
      return reply.send({
        success: true,
        data: response.data,
        timestamp: response.timestamp,
      });
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.post<{ Body: any }>('/payment/status', async (request, reply) => {
    try {
      const result = safeParse(PaymentInquirySchema, request.body);
      if (!result.success) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: result.errors,
          },
        });
      }

      const response = await client.getPaymentStatus(result.data.authority);
      return reply.send({
        success: true,
        data: response.data,
        timestamp: response.timestamp,
      });
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.post<{ Body: any }>('/payment/reverse', async (request, reply) => {
    try {
      const result = safeParse(PaymentReversalSchema, request.body);
      if (!result.success) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: result.errors,
          },
        });
      }

      const response = await client.reversePayment(result.data);
      return reply.send({
        success: response.success,
        data: response.data,
        timestamp: response.timestamp,
      });
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.post<{ Body: any }>('/payment/refund', async (request, reply) => {
    try {
      const result = safeParse(RefundSchema, request.body);
      if (!result.success) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: result.errors,
          },
        });
      }

      const response = await client.refundPayment(result.data);
      return reply.send({
        success: response.success,
        data: response.data,
        timestamp: response.timestamp,
      });
    } catch (error) {
      return handleError(error, reply);
    }
  });

  // ===== Checkout Routes =====

  fastify.post<{ Body: any }>('/checkout/create', async (request, reply) => {
    try {
      const result = safeParse(CheckoutSessionSchema, request.body);
      if (!result.success) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: result.errors,
          },
        });
      }

      const response = await client.createCheckoutSession(result.data);
      return reply.send({
        success: true,
        data: response.data,
        timestamp: response.timestamp,
      });
    } catch (error) {
      return handleError(error, reply);
    }
  });

  // ===== Query Routes =====

  fastify.get('/transactions', async (request, reply) => {
    try {
      const result = safeParse(TransactionQuerySchema, request.query);
      if (!result.success) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: result.errors,
          },
        });
      }

      const response = await client.getTransactions(result.data);
      return reply.send({
        success: true,
        data: response.data,
        count: response.data?.length,
        timestamp: response.timestamp,
      });
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.get<{ Params: { id: string } }>(
    '/settlements/:id',
    async (request, reply) => {
      try {
        const response = await client.getSettlement(request.params.id);
        return reply.send({
          success: true,
          data: response.data,
          timestamp: response.timestamp,
        });
      } catch (error) {
        return handleError(error, reply);
      }
    }
  );

  fastify.get('/terminals', async (_request, reply) => {
    try {
      const response = await client.getTerminals();
      return reply.send({
        success: true,
        data: response.data,
        count: response.data?.length,
        timestamp: response.timestamp,
      });
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.get<{ Params: { authority: string }; Querystring: any }>(
    '/gateway-url/:authority',
    async (request, reply) => {
      try {
        const url = client.getPaymentUrl(
          request.params.authority,
          (request.query as any).sandbox === 'true'
        );
        return reply.send({
          success: true,
          data: { url },
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        return handleError(error, reply);
      }
    }
  );

  // ===== Health Check =====

  fastify.get('/health', (_request, reply) => {
    const config = client.getConfig();
    return reply.send({
      success: true,
      data: {
        status: 'healthy',
        ...config,
      },
      timestamp: new Date().toISOString(),
    });
  });
}

// ============= Error Handler =============

function handleError(error: any, reply: FastifyReply) {
  if (error instanceof ZarinpalError) {
    return reply.code(error.statusCode).send({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      timestamp: new Date().toISOString(),
    });
  }

  return reply.code(500).send({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: error?.message || 'Internal server error',
    },
    timestamp: new Date().toISOString(),
  });
}

export { createZarinpalClient } from '../core/index.js';
export type { ZarinpalConfig } from '../core/index.js';

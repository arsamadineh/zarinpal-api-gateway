/**
 * Zarinpal Payment Gateway - Express.js Adapter
 * Drop-in Express.js integration with pre-built routes
 */

import express, { Router, Request, Response, NextFunction } from 'express';
import {
  ZarinpalClient,
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

// ============= Middleware =============

/**
 * Middleware to attach ZarinpalClient to request
 */
export function zarinpalMiddleware(client: ZarinpalClient) {
  return (req: Request, res: Response, next: NextFunction) => {
    (req as any).zarinpal = client;
    next();
  };
}

/**
 * Error handler middleware for Zarinpal errors
 */
export function zarinpalErrorHandler(
  err: Error,
  _req: Request,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  const res = _res;
  if (err instanceof ZarinpalError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
      timestamp: new Date().toISOString(),
    });
  }

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: err.message || 'Internal server error',
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Validation middleware factory
 */
export function validateRequest(schema: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = safeParse(schema, req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: result.errors,
        },
        timestamp: new Date().toISOString(),
      });
    }
    (req as any).validatedData = result.data;
    next();
  };
}

// ============= Route Handlers =============

/**
 * POST /payment/request
 * Request a new payment
 */
async function handlePaymentRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const client = (req as any).zarinpal as ZarinpalClient;
    const data = (req as any).validatedData;

    const result = await client.requestPayment(data);

    res.json({
      success: true,
      data: result.data,
      timestamp: result.timestamp,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /payment/verify
 * Verify a completed payment
 */
async function handlePaymentVerify(req: Request, res: Response, next: NextFunction) {
  try {
    const client = (req as any).zarinpal as ZarinpalClient;
    const data = (req as any).validatedData;

    const result = await client.verifyPayment(data);

    res.json({
      success: true,
      data: result.data,
      timestamp: result.timestamp,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /payment/status
 * Get payment status/inquiry
 */
async function handlePaymentStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const client = (req as any).zarinpal as ZarinpalClient;
    const data = (req as any).validatedData;

    const result = await client.getPaymentStatus(data.authority);

    res.json({
      success: true,
      data: result.data,
      timestamp: result.timestamp,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /payment/reverse
 * Reverse a payment authorization
 */
async function handlePaymentReverse(req: Request, res: Response, next: NextFunction) {
  try {
    const client = (req as any).zarinpal as ZarinpalClient;
    const data = (req as any).validatedData;

    const result = await client.reversePayment(data);

    res.json({
      success: result.success,
      data: result.data,
      timestamp: result.timestamp,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /payment/refund
 * Refund a verified payment
 */
async function handlePaymentRefund(req: Request, res: Response, next: NextFunction) {
  try {
    const client = (req as any).zarinpal as ZarinpalClient;
    const data = (req as any).validatedData;

    const result = await client.refundPayment(data);

    res.json({
      success: result.success,
      data: result.data,
      timestamp: result.timestamp,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /checkout/create
 * Create a checkout session
 */
async function handleCheckoutCreate(req: Request, res: Response, next: NextFunction) {
  try {
    const client = (req as any).zarinpal as ZarinpalClient;
    const data = (req as any).validatedData;

    const result = await client.createCheckoutSession(data);

    res.json({
      success: true,
      data: result.data,
      timestamp: result.timestamp,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /transactions
 * Query transactions
 */
async function handleTransactionsQuery(req: Request, res: Response, next: NextFunction) {
  try {
    const client = (req as any).zarinpal as ZarinpalClient;
    const result = safeParse(TransactionQuerySchema, req.query);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: result.errors,
        },
      });
    }

    const queryResult = await client.getTransactions(result.data as Parameters<typeof client.getTransactions>[0]);

    res.json({
      success: true,
      data: queryResult.data,
      count: queryResult.data?.length,
      timestamp: queryResult.timestamp,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /settlements/:id
 * Get settlement information
 */
async function handleSettlementInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const client = (req as any).zarinpal as ZarinpalClient;
    const { id } = req.params;

    const result = await client.getSettlement(id);

    res.json({
      success: true,
      data: result.data,
      timestamp: result.timestamp,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /terminals
 * Get merchant terminals
 */
async function handleTerminalsList(req: Request, res: Response, next: NextFunction) {
  try {
    const client = (req as any).zarinpal as ZarinpalClient;
    const result = await client.getTerminals();

    res.json({
      success: true,
      data: result.data,
      count: result.data?.length,
      timestamp: result.timestamp,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /gateway-url/:authority
 * Get payment gateway redirect URL
 */
function handleGatewayUrl(req: Request, res: Response) {
  try {
    const client = (req as any).zarinpal as ZarinpalClient;
    const { authority } = req.params;
    const { sandbox } = req.query;

    const url = client.getPaymentUrl(authority as string, (sandbox as string) === 'true');

    res.json({
      success: true,
      data: { url },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    throw error;
  }
}

// ============= Router Factory =============

/**
 * Create a complete Express router with all Zarinpal endpoints
 */
export function createZarinpalRouter(client: ZarinpalClient): Router {
  const router = express.Router();

  // Attach client to all routes
  router.use(zarinpalMiddleware(client));

  // ===== Payment Routes =====
  router.post('/payment/request', validateRequest(PaymentRequestSchema), handlePaymentRequest);
  router.post('/payment/verify', validateRequest(PaymentVerificationSchema), handlePaymentVerify);
  router.post('/payment/status', validateRequest(PaymentInquirySchema), handlePaymentStatus);
  router.post('/payment/reverse', validateRequest(PaymentReversalSchema), handlePaymentReverse);
  router.post('/payment/refund', validateRequest(RefundSchema), handlePaymentRefund);

  // ===== Checkout Routes =====
  router.post('/checkout/create', validateRequest(CheckoutSessionSchema), handleCheckoutCreate);

  // ===== Transactions & Settlement Routes =====
  router.get('/transactions', handleTransactionsQuery);
  router.get('/settlements/:id', handleSettlementInfo);

  // ===== Terminal Routes =====
  router.get('/terminals', handleTerminalsList);

  // ===== Utility Routes =====
  router.get<{ Params: { authority: string } }>('/gateway-url/:authority', handleGatewayUrl as any);

  // ===== Health Check =====
  router.get('/health', (req, res) => {
    const client = (req as any).zarinpal as ZarinpalClient;
    const config = client.getConfig();

    res.json({
      success: true,
      data: {
        status: 'healthy',
        ...config,
      },
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}

// ============= App Setup Helper =============

/**
 * Setup Zarinpal on an existing Express app
 */
export function setupZarinpal(app: express.Express, config: any) {
  const client = createZarinpalClient(config);
  const router = createZarinpalRouter(client);

  app.use('/api/zarinpal', router);
  app.use(zarinpalErrorHandler);

  return { client, router };
}

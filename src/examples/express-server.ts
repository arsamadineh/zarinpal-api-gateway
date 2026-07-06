/**
 * Zarinpal Express.js Example Server
 * Complete production-ready setup
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { setupZarinpal } from '../adapters/express.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============= Middleware =============

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());

// ============= Zarinpal Setup =============

const zarinpalConfig = {
  merchantId: process.env.ZARINPAL_MERCHANT_ID || 'test-merchant',
  apiKey: process.env.ZARINPAL_API_KEY,
  sandbox: process.env.ZARINPAL_SANDBOX !== 'false',
  timeout: parseInt(process.env.ZARINPAL_TIMEOUT || '30000', 10),
  retries: parseInt(process.env.ZARINPAL_RETRIES || '3', 10),
};

const { client, router } = setupZarinpal(app, zarinpalConfig);

// ============= Example Routes =============

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Zarinpal Payment Gateway API v2.0',
    endpoints: [
      'POST /api/zarinpal/payment/request - Request a payment',
      'POST /api/zarinpal/payment/verify - Verify a payment',
      'POST /api/zarinpal/payment/status - Check payment status',
      'POST /api/zarinpal/payment/reverse - Reverse a payment',
      'POST /api/zarinpal/payment/refund - Refund a payment',
      'POST /api/zarinpal/session/validate - Validate session',
      'POST /api/zarinpal/checkout/create - Create checkout',
      'GET /api/zarinpal/transactions - Query transactions',
      'GET /api/zarinpal/settlements/:id - Get settlement info',
      'GET /api/zarinpal/terminals - List terminals',
      'GET /api/zarinpal/gateway-url/:authority - Get payment URL',
      'GET /api/zarinpal/health - Health check',
    ],
    config: zarinpalConfig,
  });
});

// Example: Create a payment
app.post('/example/create-payment', async (req, res, next) => {
  try {
    const result = await client.requestPayment({
      amount: 50000, // 50,000 Rials
      callback_url: `http://localhost:${PORT}/example/callback`,
      description: 'Example Payment',
      email: 'user@example.com',
      mobile: '09123456789',
      order_id: `order-${Date.now()}`,
    });

    const paymentUrl = client.getPaymentUrl(result.data!.authority, zarinpalConfig.sandbox);

    res.json({
      success: true,
      data: {
        authority: result.data!.authority,
        paymentUrl,
        code: result.data!.code,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Example: Callback handler
app.post('/example/callback', (req, res) => {
  const { Authority, Status } = req.body;

  if (Status === 'OK') {
    res.json({
      success: true,
      message: 'Payment successful',
      data: { Authority },
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Payment failed or canceled',
      data: { Authority, Status },
    });
  }
});

// ============= Error Handler =============

app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);

  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Internal server error',
    },
    timestamp: new Date().toISOString(),
  });
});

// ============= Start Server =============

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║  Zarinpal Gateway API v2.0               ║
║  ${zarinpalConfig.sandbox ? '🔒 SANDBOX MODE' : '🔓 PRODUCTION MODE'}                     ║
║  Listening on http://localhost:${PORT}    ║
╚══════════════════════════════════════════╝
  `);

  console.log('Configuration:');
  console.log(`  - Merchant ID: ${zarinpalConfig.merchantId}`);
  console.log(`  - Sandbox: ${zarinpalConfig.sandbox}`);
  console.log(`  - Timeout: ${zarinpalConfig.timeout}ms`);
  console.log(`  - Retries: ${zarinpalConfig.retries}`);
  console.log('\nAPI Docs: http://localhost:3000/');
});

export default app;

# Zarinpal Payment Gateway v2.0 🚀

> Production-grade, type-safe Zarinpal payment gateway with multi-framework support, sandbox mode, and complete Zarinpal API v4 implementation.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue.svg)](https://www.typescriptlang.org/)
[![npm](https://img.shields.io/npm/v/@zarinpal/gateway.svg)](https://www.npmjs.com/package/@zarinpal/gateway)

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [API Documentation](#api-documentation)
- [Framework Integration](#framework-integration)
- [Sandbox Testing](#sandbox-testing)
- [Deployment](#deployment)
- [Agent Setup (AI Integration)](#agent-setup-ai-integration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Features ✨

- **🚀 Multi-Framework Support**
  - Express.js (fully implemented)
  - Fastify (adapter included)
  - Hono (minimal implementation)
  - Zero configuration needed

- **🔒 Complete Type Safety**
  - Full TypeScript support
  - Zod schema validation for all inputs
  - Comprehensive error types
  - IDE autocomplete everywhere

- **🏪 Full Zarinpal API v4 Coverage**
  - Payment requests & verification
  - Payment reversal & refunds
  - Session validation & checkout
  - Transaction queries
  - Settlement information
  - Terminal management
  - Card masking & metadata

- **🧪 Sandbox Mode Built-In**
  - Test payments without real transactions
  - Sandbox/production toggle
  - Mock responses for development
  - No credential change needed

- **⚡ Production Ready**
  - Automatic retries with exponential backoff
  - Configurable timeouts
  - Comprehensive error handling
  - Request logging & monitoring
  - Rate limiting ready
  - Security headers included

- **📦 Easy Installation**
  - One-command setup script
  - Interactive configuration
  - Automatic dependency installation
  - Ready-to-run examples

- **🔐 Security Best Practices**
  - HTTPS enforcement
  - CORS configuration
  - Rate limiting
  - Input validation
  - Secure error handling

---

## Quick Start ⚡

### 30-Second Setup

```bash
# 1. Clone
git clone https://github.com/arsamadineh/zarinpal-api-gateway.git
cd zarinpal-api-gateway

# 2. Setup (interactive configuration)
npm run setup

# 3. Start
npm run dev

# Done! 🎉 Visit http://localhost:3000
```

That's it! The setup script handles everything:
- Installs dependencies
- Creates `.env` file
- Collects your Zarinpal credentials
- Configures sandbox/production mode

---

## Installation 📦

### Prerequisites

- Node.js 20.0 or higher
- npm, pnpm, or yarn
- Zarinpal merchant account ([free signup](https://zarinpal.com))

### Via NPM (As a Package)

```bash
npm install @zarinpal/gateway

# Or with other package managers
pnpm add @zarinpal/gateway
yarn add @zarinpal/gateway
```

### From Source

```bash
git clone https://github.com/arsamadineh/zarinpal-api-gateway.git
cd zarinpal-api-gateway
npm install
npm run build
```

---

## Configuration 🔧

### Environment Variables

Create `.env` file (or use `npm run setup`):

```env
# Core Settings
NODE_ENV=development
PORT=3000

# Zarinpal (get from https://zarinpal.com/dashboard)
ZARINPAL_MERCHANT_ID=your-merchant-id
ZARINPAL_API_KEY=optional-api-key
ZARINPAL_SANDBOX=true              # Set to false for production

# API Settings
ZARINPAL_TIMEOUT=30000             # Request timeout (ms)
ZARINPAL_RETRIES=3                 # Retry failed requests

# CORS (restrict in production)
CORS_ORIGIN=*                       # Change to your domain in production

# Logging
LOG_LEVEL=info                      # debug, info, warn, error

# Optional: Database
# DATABASE_URL=postgresql://user:pass@localhost:5432/zarinpal

# Optional: JWT Authentication
# JWT_SECRET=your-super-secret-key

# Optional: Webhook Secret
# WEBHOOK_SECRET=your-webhook-secret
```

### Programmatic Configuration

```typescript
interface ZarinpalConfig {
  merchantId: string;           // Required: Your merchant ID
  apiKey?: string;              // Optional: API key
  sandbox?: boolean;            // Default: false
  timeout?: number;             // Default: 30000 (ms)
  retries?: number;             // Default: 3
  logger?: CustomLogger;        // Optional: Custom logger
}
```

---

## Usage Examples 📚

### 1. Express.js Server (Quickest)

```typescript
import express from 'express';
import { setupZarinpal } from '@zarinpal/gateway/express';

const app = express();
app.use(express.json());

// One-liner setup!
setupZarinpal(app, {
  merchantId: process.env.ZARINPAL_MERCHANT_ID!,
  sandbox: true,
});

app.listen(3000, () => {
  console.log('✅ Zarinpal API ready on http://localhost:3000');
  console.log('📚 Docs: http://localhost:3000');
  console.log('🔗 All routes start with /api/zarinpal');
});
```

**That's all you need!** Instantly get these routes:
- `POST /api/zarinpal/payment/request`
- `POST /api/zarinpal/payment/verify`
- `POST /api/zarinpal/payment/reverse`
- `POST /api/zarinpal/payment/refund`
- `GET /api/zarinpal/transactions`
- `GET /api/zarinpal/terminals`
- ...and more!

### 2. Core Client Usage (Direct)

```typescript
import { createZarinpalClient } from '@zarinpal/gateway';

// Create client once
const zarinpal = createZarinpalClient({
  merchantId: 'YOUR_MERCHANT_ID',
  sandbox: true,
});

// Request payment
const payment = await zarinpal.requestPayment({
  amount: 50000,                              // Rials
  callback_url: 'https://example.com/callback',
  description: 'Product Purchase',
  email: 'user@example.com',
  mobile: '09123456789',
  order_id: `order-${Date.now()}`,
  metadata: { userId: '123', productId: '456' },
});

if (payment.success) {
  // Get payment URL
  const paymentUrl = zarinpal.getPaymentUrl(payment.data!.authority);
  console.log('Redirect to:', paymentUrl);
  
  // Save authority in your database
  await savePaymentToDb({
    authority: payment.data!.authority,
    amount: 50000,
    ref_id: payment.data!.ref_id,
  });
}

// Later, in your callback handler
const verification = await zarinpal.verifyPayment({
  authority: 'A00000000000000000000000000',  // From query params
  amount: 50000,
});

if (verification.success) {
  console.log('✅ Payment verified!');
  console.log('Ref ID:', verification.data?.ref_id);
  console.log('Card:', verification.data?.card_pan);
  
  // Update order status, send confirmation email, etc.
  await updateOrderStatus('paid', verification.data?.ref_id);
}
```

### 3. Complete Payment Flow

**Frontend redirects to payment:**
```javascript
// Step 1: Request payment from your backend
const response = await fetch('/api/payment/request', {
  method: 'POST',
  body: JSON.stringify({
    amount: 50000,
    callback_url: 'https://yoursite.com/payment/callback',
    description: 'Order #12345',
  }),
});

const { data } = await response.json();

// Step 2: Redirect to Zarinpal
window.location.href = `https://www.zarinpal.com/pg/StartPay/${data.authority}`;
```

**Backend handles callback:**
```typescript
app.get('/payment/callback', async (req, res) => {
  const { Authority, Status } = req.query;

  if (Status === 'OK') {
    // Verify the payment
    const result = await zarinpal.verifyPayment({
      authority: Authority as string,
      amount: 50000,
    });

    if (result.success) {
      res.json({ success: true, refId: result.data?.ref_id });
      // Fulfill order
    }
  } else {
    res.json({ success: false, error: 'User canceled payment' });
  }
});
```

### 4. Advanced: Custom Logger

```typescript
const zarinpal = createZarinpalClient({
  merchantId: 'YOUR_MERCHANT_ID',
  logger: {
    debug: (msg, data) => console.debug(`[ZP] ${msg}`, data),
    info: (msg, data) => console.info(`[ZP] ${msg}`, data),
    warn: (msg, data) => console.warn(`[ZP] ${msg}`, data),
    error: (msg, err) => console.error(`[ZP] ${msg}`, err),
  },
});
```

### 5. Error Handling

```typescript
import {
  ZarinpalError,
  ValidationError,
  NetworkError,
  AuthenticationError,
} from '@zarinpal/gateway';

try {
  await zarinpal.requestPayment({ amount: 500 }); // Too low!
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('❌ Invalid data:', error.details);
    res.status(400).json({ error: error.message });
  } else if (error instanceof NetworkError) {
    console.error('⚠️ Network issue:', error.message);
    res.status(503).json({ error: 'Service temporarily unavailable' });
  } else if (error instanceof AuthenticationError) {
    console.error('🔒 Auth failed:', error.message);
    res.status(401).json({ error: 'Invalid credentials' });
  } else if (error instanceof ZarinpalError) {
    console.error('❌ Zarinpal error:', error.code, error.message);
    res.status(400).json({ error: error.message });
  }
}
```

### 6. Refunds & Reversals

```typescript
// Reverse a payment (before verification)
const reversal = await zarinpal.reversePayment({
  authority: 'A00000000000000000000000000',
});

// Refund a verified payment
const refund = await zarinpal.refundPayment({
  ref_id: '12345678',
  amount: 25000,  // Partial refund (omit for full)
});

if (refund.success) {
  console.log('✅ Refund successful:', refund.data?.ref_id);
}
```

### 7. Query Transactions

```typescript
// Get all transactions
const transactions = await zarinpal.getTransactions({
  limit: 50,
  offset: 0,
});

// Filter by date
const dailyTransactions = await zarinpal.getTransactions({
  from_date: '2026-07-01',
  to_date: '2026-07-06',
  limit: 100,
});

// Get specific transaction
const transaction = await zarinpal.getTransactions({
  ref_id: '12345678',
});

console.log(`Found ${transactions.data?.length} transactions`);
```

---

## API Documentation 📖

### REST Endpoints

All endpoints are prefixed with `/api/zarinpal`

#### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payment/request` | Request a new payment |
| POST | `/payment/verify` | Verify a completed payment |
| POST | `/payment/status` | Get payment status |
| POST | `/payment/reverse` | Reverse authorization |
| POST | `/payment/refund` | Refund a payment |

#### Transaction Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/transactions` | Query transactions |
| GET | `/settlements/:id` | Get settlement info |

#### Terminal Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/terminals` | List merchant terminals |

#### Utility Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/gateway-url/:authority` | Get payment gateway URL |
| GET | `/health` | Health check |

**Full API docs:** See [API.md](./API.md)

---

## Framework Integration 🔌

### Express.js ✅ (Default, Fully Supported)

```typescript
import { setupZarinpal } from '@zarinpal/gateway/express';

setupZarinpal(app, {
  merchantId: process.env.ZARINPAL_MERCHANT_ID!,
  sandbox: true,
});
```

### Fastify ✅

```typescript
import { registerZarinpal } from '@zarinpal/gateway/fastify';

await app.register(registerZarinpal, {
  merchantId: process.env.ZARINPAL_MERCHANT_ID!,
  sandbox: true,
});
```

### Hono ✅

```typescript
import { createZarinpalRouter } from '@zarinpal/gateway/hono';
import { createZarinpalClient } from '@zarinpal/gateway';

const client = createZarinpalClient({ merchantId: '...' });
const router = createZarinpalRouter(client);

app.route('/api/zarinpal', router);
```

---

## Sandbox Testing 🧪

### Enable Sandbox

```env
ZARINPAL_SANDBOX=true
```

### Test Credentials

- Merchant ID: Any value works in sandbox
- Authority: Use `A00000000000000000000000000` or any valid format
- Amount: Any amount >= 1,000 Rials

### Example Flow

```bash
# 1. Request payment
curl -X POST http://localhost:3000/api/zarinpal/payment/request \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "description": "Test Payment",
    "callback_url": "http://localhost:3000/callback"
  }'

# Response: { "authority": "A00000000000000000000000000" }

# 2. Verify with same authority
curl -X POST http://localhost:3000/api/zarinpal/payment/verify \
  -H "Content-Type: application/json" \
  -d '{
    "authority": "A00000000000000000000000000",
    "amount": 50000
  }'
```

---

## Deployment 🚀

### Docker

```bash
# Build
docker build -t zarinpal-gateway .

# Run
docker run -p 3000:3000 \
  -e ZARINPAL_MERCHANT_ID=xxx \
  -e ZARINPAL_SANDBOX=false \
  zarinpal-gateway
```

### VPS/Linux

```bash
# Install
git clone ...
npm install
npm run build

# Start with systemd
sudo systemctl start zarinpal-gateway
sudo systemctl status zarinpal-gateway
```

### Heroku

```bash
git push heroku main
```

### Vercel/Railway

One-click deployment available on platform dashboards.

**Full deployment guide:** See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## Agent Setup (AI Integration) 🤖

### For Claude, ChatGPT, or Any AI Agent

Paste this prompt to your AI agent to set up Zarinpal integration automatically:

```
I need to integrate Zarinpal payment gateway into my application. Here's what I want:

**Project Details:**
- Framework: [Express/Fastify/Next.js/etc]
- Current state: [Fresh project/Existing codebase]
- Environment: [Development/Production]

**Requirements:**
- Payment request & verification endpoints
- Refund functionality
- Transaction history queries
- Sandbox mode for testing
- Type-safe with TypeScript
- Comprehensive error handling

**Steps:**
1. Clone the repository: https://github.com/arsamadineh/zarinpal-api-gateway.git
2. Review the current implementation in `/src/core/`
3. Integrate into my app using the appropriate adapter
4. Set up environment variables
5. Create payment routes specific to my needs
6. Add database models for storing transactions
7. Implement callback handler
8. Add comprehensive error handling
9. Test with sandbox mode

**Resources:**
- API Docs: See API.md in the repository
- Deployment: See DEPLOYMENT.md
- Examples: Check src/examples/

**Key Files to Customize:**
- `.env` - Set your merchant ID
- `src/examples/express-server.ts` - Base server
- `src/adapters/express.ts` - Route handlers
- `src/core/client.ts` - Core client logic

Please implement this step-by-step and show me the working result.
```

### For Cursor/VS Code Copilot

Add to your `.cursorrules` file:

```
# Zarinpal Payment Gateway Integration

When implementing Zarinpal payment functionality:

1. Always use the @zarinpal/gateway package or local implementation
2. Validate all amounts (minimum 1,000 Rials)
3. Handle both success and error cases
4. Use TypeScript with Zod validation
5. Implement proper error handling with custom error types
6. Store authority and ref_id for reconciliation
7. Use sandbox mode in development
8. Implement idempotent payment endpoints
9. Always verify payments before fulfilling orders
10. Log all payment operations

Reference: https://github.com/arsamadineh/zarinpal-api-gateway
```

### For GitHub Copilot

When you see a payment-related comment like:
```typescript
// TODO: Add payment request endpoint
```

Copilot will suggest using the Zarinpal gateway based on your codebase context.

### Automation Scripts

Run this to auto-setup in your project:

```bash
# Download and initialize
curl https://raw.githubusercontent.com/arsamadineh/zarinpal-api-gateway/main/scripts/setup.mjs | node

# Or with npx
npx zarinpal-gateway@latest init
```

---

## Troubleshooting 🔧

### "Invalid merchant ID"

```bash
# Check environment variable
echo $ZARINPAL_MERCHANT_ID

# Verify in .env file
cat .env | grep ZARINPAL_MERCHANT_ID

# Get from Zarinpal dashboard:
# https://zarinpal.com/dashboard
```

### "Request timeout"

```env
# Increase timeout
ZARINPAL_TIMEOUT=60000  # 60 seconds
ZARINPAL_RETRIES=5      # More retries
```

### "Validation error: Amount must be at least 1,000"

```typescript
// Fix: Amounts are in Rials, not Tomans
const amount = 50000;  // ✅ 50,000 Rials
// NOT 500 (which is only 500 Rials)
```

### "CORS error"

```env
# Set correct origin
CORS_ORIGIN=https://yourdomain.com

# Or allow all in development
CORS_ORIGIN=*
```

### "Payment verification failed"

```typescript
// Make sure authority and amount match exactly
const verification = await zarinpal.verifyPayment({
  authority: 'A00000000000000000000000000',  // From callback
  amount: 50000,                             // Same as request
});
```

### Server won't start

```bash
# Check if port is in use
lsof -i :3000

# Use different port
PORT=3001 npm run dev

# Check Node version
node --version  # Should be 20+
```

---

## Testing 🧪

```bash
# Run tests
npm run test

# With coverage
npm run test:coverage

# Watch mode
npm run test -- --watch
```

---

## Contributing 🤝

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Changelog

### v2.0.0 (July 2026)

✅ **New Features**
- Complete Zarinpal v4 API implementation
- Multi-framework support (Express, Fastify, Hono)
- Built-in sandbox mode
- Full TypeScript support with Zod validation
- Comprehensive error handling
- One-command setup

🔄 **Improvements**
- Type-safe client library
- Better documentation
- Improved error messages
- Production-ready configuration
- Security best practices

🐛 **Fixes**
- Fixed payment verification flow
- Corrected error handling
- Improved validation

---

## License 📄

MIT License - see [LICENSE](./LICENSE) file

```
Copyright (c) 2026 Arsam Adineh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## Support & Community 💬

- **GitHub Issues**: [Report bugs](https://github.com/arsamadineh/zarinpal-api-gateway/issues)
- **Discussions**: [Ask questions](https://github.com/arsamadineh/zarinpal-api-gateway/discussions)
- **Zarinpal Docs**: [Official API](https://www.zarinpal.com/docs/)
- **Email**: [Get help](mailto:support@zarinpal.com)

---

## Roadmap 🗺️

- [ ] Fastify adapter (routes implementation)
- [ ] Hono adapter (full implementation)
- [ ] Webhook support for async notifications
- [ ] Database persistence layer
- [ ] GraphQL API
- [ ] Admin dashboard
- [ ] CLI management tool
- [ ] Next.js/Nuxt integration examples
- [ ] Mobile SDK support
- [ ] Monitoring & analytics dashboard

---

## Credits 🙏

Built by [Arsam Adineh](https://github.com/arsamadineh)

Inspired by production payment integrations and best practices from:
- [Stripe.js](https://stripe.com/docs/js)
- [Square SDKs](https://developer.squareup.com/)
- [Zarinpal API](https://www.zarinpal.com/docs/)

---

<div align="center">

### Made with ❤️ for Iranian developers

**Star this project if it helps you!** ⭐

[Visit Zarinpal](https://zarinpal.com) • [Read Docs](./API.md) • [Deploy Now](./DEPLOYMENT.md) • [GitHub](https://github.com/arsamadineh/zarinpal-api-gateway)

</div>

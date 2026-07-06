# API Documentation

## Zarinpal Payment Gateway v2.0

Complete REST API and programmatic interface for Zarinpal payment processing.

---

## Table of Contents

1. [Payment Management](#payment-management)
2. [Session & Checkout](#session--checkout)
3. [Transactions](#transactions)
4. [Terminals](#terminals)
5. [Error Handling](#error-handling)
6. [Examples](#examples)

---

## Payment Management

### Request Payment

**Endpoint:** `POST /api/zarinpal/payment/request`

Request a new payment from Zarinpal.

**Request Body:**
```json
{
  "amount": 50000,
  "callback_url": "https://example.com/callback",
  "description": "Product Purchase",
  "email": "user@example.com",
  "mobile": "09123456789",
  "order_id": "order-12345",
  "metadata": {
    "user_id": "123",
    "product": "item"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "authority": "A00000000000000000000000000",
    "code": 100,
    "ref_id": "12345678"
  },
  "timestamp": "2026-07-06T02:32:40.674Z"
}
```

**Field Descriptions:**
- `amount` (number, required): Amount in Rials (minimum 1,000)
- `callback_url` (string, required): HTTPS URL for payment callback
- `description` (string, required): Payment description
- `email` (string, optional): Customer email
- `mobile` (string, optional): Customer mobile (09xxxxxxxxx format)
- `order_id` (string, optional): Unique order identifier
- `metadata` (object, optional): Custom key-value data

**Error Responses:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Amount must be at least 1,000 Rials",
    "details": [...]
  }
}
```

---

### Verify Payment

**Endpoint:** `POST /api/zarinpal/payment/verify`

Verify a completed payment after user returns from gateway.

**Request Body:**
```json
{
  "authority": "A00000000000000000000000000",
  "amount": 50000
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": 100,
    "ref_id": "12345678",
    "card_hash": "abc123...",
    "card_pan": "621986****1234"
  },
  "timestamp": "2026-07-06T02:32:40.674Z"
}
```

**Status Codes:**
- `100`: Payment verified successfully
- Other codes indicate verification failure

---

### Get Payment Status

**Endpoint:** `POST /api/zarinpal/payment/status`

Check payment status without full verification.

**Request Body:**
```json
{
  "authority": "A00000000000000000000000000"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": 100,
    "ref_id": "12345678",
    "card_hash": "abc123...",
    "card_pan": "621986****1234",
    "total_commission": 500
  },
  "timestamp": "2026-07-06T02:32:40.674Z"
}
```

---

### Reverse Payment

**Endpoint:** `POST /api/zarinpal/payment/reverse`

Reverse a payment authorization (before verification).

**Request Body:**
```json
{
  "authority": "A00000000000000000000000000"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": 100,
    "ref_id": "12345678"
  },
  "timestamp": "2026-07-06T02:32:40.674Z"
}
```

---

### Refund Payment

**Endpoint:** `POST /api/zarinpal/payment/refund`

Refund a verified payment (partial or full).

**Request Body:**
```json
{
  "ref_id": "12345678",
  "amount": 25000
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": 100,
    "ref_id": "12345678",
    "message": "Refund successful"
  },
  "timestamp": "2026-07-06T02:32:40.674Z"
}
```

**Notes:**
- `ref_id` is obtained from payment verification
- Omit `amount` for full refund
- Partial refunds may not be supported for all terminal types

---

## Session & Checkout

### Create Checkout Session

**Endpoint:** `POST /api/zarinpal/checkout/create`

Create a checkout session for multi-item purchases.

**Request Body:**
```json
{
  "amount": 100000,
  "currency": "IRR",
  "items": [
    {
      "id": "item-1",
      "name": "Product A",
      "price": 50000,
      "quantity": 1
    },
    {
      "id": "item-2",
      "name": "Product B",
      "price": 50000,
      "quantity": 1
    }
  ],
  "customer": {
    "email": "user@example.com",
    "mobile": "09123456789",
    "name": "John Doe",
    "national_id": "0123456789"
  },
  "metadata": {
    "cart_id": "cart-123"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "session_id": "session-abc123...",
    "checkout_url": "https://zarinpal.com/checkout/session-abc123",
    "expires_at": "2026-07-06T03:35:53.765Z"
  },
  "timestamp": "2026-07-06T02:32:40.674Z"
}
```

---

## Transactions

### Query Transactions

**Endpoint:** `GET /api/zarinpal/transactions`

Query payment transactions with optional filters.

**Query Parameters:**
```
GET /api/zarinpal/transactions?ref_id=12345678&limit=10&offset=0
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `ref_id` | string | Filter by reference ID |
| `authority` | string | Filter by authority |
| `settlement_id` | string | Filter by settlement |
| `from_date` | string | Start date (YYYY-MM-DD) |
| `to_date` | string | End date (YYYY-MM-DD) |
| `limit` | number | Results per page (1-100) |
| `offset` | number | Pagination offset |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "ref_id": "12345678",
      "authority": "A00000000000000000000000000",
      "amount": 50000,
      "currency": "IRR",
      "status": "paid",
      "created_at": "2026-07-06T02:30:00.000Z",
      "verified_at": "2026-07-06T02:31:00.000Z",
      "card_pan": "621986****1234"
    }
  ],
  "count": 1,
  "timestamp": "2026-07-06T02:32:40.674Z"
}
```

---

### Get Settlement

**Endpoint:** `GET /api/zarinpal/settlements/:id`

Get settlement information for a specific settlement.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "settlement_id": "settlement-123",
    "status": "settlement_ok",
    "total_amount": 500000,
    "fee": 5000,
    "net_amount": 495000,
    "created_at": "2026-07-06T00:00:00.000Z",
    "transactions_count": 10
  },
  "timestamp": "2026-07-06T02:32:40.674Z"
}
```

---

## Terminals

### List Terminals

**Endpoint:** `GET /api/zarinpal/terminals`

Get list of merchant terminals.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "terminal_id": "123456",
      "terminal_name": "Main Terminal",
      "terminal_code": "MAIN",
      "created_at": "2026-01-01T00:00:00.000Z",
      "is_active": true,
      "commission_percent": 1.0
    }
  ],
  "count": 1,
  "timestamp": "2026-07-06T02:32:40.674Z"
}
```

---

## Utility Endpoints

### Get Payment Gateway URL

**Endpoint:** `GET /api/zarinpal/gateway-url/:authority`

Generate Zarinpal payment gateway URL for redirect.

**Query Parameters:**
- `sandbox` (boolean, optional): Use sandbox URL

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "url": "https://www.zarinpal.com/pg/StartPay/A00000000000000000000000000"
  },
  "timestamp": "2026-07-06T02:32:40.674Z"
}
```

---

### Health Check

**Endpoint:** `GET /api/zarinpal/health`

Check gateway health and configuration.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "merchantId": "your-merchant-id",
    "isSandbox": true,
    "baseUrl": "https://sandbox.zarinpal.com",
    "timeout": 30000,
    "retries": 3
  },
  "timestamp": "2026-07-06T02:32:40.674Z"
}
```

---

## Error Handling

### Error Response Format

All errors follow this standard format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  },
  "timestamp": "2026-07-06T02:32:40.674Z"
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `AUTHENTICATION_ERROR` | 401 | Invalid credentials |
| `NETWORK_ERROR` | 503 | Network/API unavailable |
| `ZARINPAL_ERROR` | 400 | Zarinpal-specific error |
| `INTERNAL_ERROR` | 500 | Server error |

### Common Errors

**Insufficient Amount:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Amount must be at least 1,000 Rials",
    "details": { "amount": 500 }
  }
}
```

**Invalid Authority:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid authority",
    "details": { "authority": "invalid" }
  }
}
```

**Payment Verification Failed:**
```json
{
  "success": false,
  "error": {
    "code": "ZARINPAL_ERROR",
    "message": "Payment verification failed",
    "details": { "code": 11 }
  }
}
```

---

## Examples

### Complete Payment Flow

#### Step 1: Request Payment
```bash
curl -X POST http://localhost:3000/api/zarinpal/payment/request \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "callback_url": "http://example.com/payment/callback",
    "description": "Product Purchase",
    "email": "user@example.com"
  }'
```

Response contains `authority`. Redirect user to:
```
https://www.zarinpal.com/pg/StartPay/{authority}
```

#### Step 2: Handle Callback
User completes payment and is redirected to your `callback_url` with query params:
```
?Authority=A00000000000000000000000000&Status=OK
```

#### Step 3: Verify Payment
```bash
curl -X POST http://localhost:3000/api/zarinpal/payment/verify \
  -H "Content-Type: application/json" \
  -d '{
    "authority": "A00000000000000000000000000",
    "amount": 50000
  }'
```

#### Step 4: Process Payment
If verification succeeds (`status: 100`), process the order and save `ref_id` for reconciliation.

---

### Programmatic Usage

```typescript
import { createZarinpalClient } from '@zarinpal/gateway';

const client = createZarinpalClient({
  merchantId: 'YOUR_MERCHANT_ID',
  sandbox: true,
});

async function processPayment() {
  try {
    // Request payment
    const payment = await client.requestPayment({
      amount: 50000,
      callback_url: 'https://example.com/callback',
      description: 'Product Purchase',
      email: 'user@example.com',
    });

    const paymentUrl = client.getPaymentUrl(payment.data!.authority);
    console.log('Redirect user to:', paymentUrl);

    // In callback handler
    const verification = await client.verifyPayment({
      authority: 'A00000000000000000000000000',
      amount: 50000,
    });

    if (verification.success) {
      console.log('Payment verified:', verification.data?.ref_id);
      // Update order status in database
    }
  } catch (error) {
    console.error('Payment failed:', error);
  }
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Default**: 100 requests per 15 minutes per IP
- **Response Headers**: Include `RateLimit-*` headers
- **Exceeded**: Returns HTTP 429

---

## Authentication

For production deployments, consider adding JWT authentication:

```bash
curl -X POST http://localhost:3000/api/zarinpal/payment/request \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## Pagination

List endpoints support pagination:

```bash
GET /api/zarinpal/transactions?limit=10&offset=20
```

- `limit`: Results per page (1-100, default: 50)
- `offset`: Starting record (default: 0)

---

## Webhooks (Future)

Async payment notifications will be available via webhooks:

```json
POST /webhook/zarinpal
{
  "event": "payment.success",
  "data": {
    "ref_id": "12345678",
    "authority": "A00000000000000000000000000",
    "amount": 50000
  }
}
```

---

## Support

- **Issues**: GitHub Issues
- **Documentation**: Full docs at repository
- **Zarinpal**: https://www.zarinpal.com/docs/

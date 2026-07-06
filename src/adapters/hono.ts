/**
 * Zarinpal Payment Gateway - Hono Adapter
 * Drop-in Hono integration
 */

import { Hono } from 'hono';
import {
  createZarinpalClient,
  ZarinpalError,
  type ZarinpalClient,
} from '../core/index.js';

export function createZarinpalRouter(client: ZarinpalClient): Hono {
  const app = new Hono();

  // Health check
  app.get('/health', (c) => {
    const config = client.getConfig();
    return c.json({
      success: true,
      data: {
        status: 'healthy',
        ...config,
      },
      timestamp: new Date().toISOString(),
    });
  });

  // Error handler
  app.onError((err, c) => {
    if (err instanceof ZarinpalError) {
      return c.json(
        {
          success: false,
          error: {
            code: err.code,
            message: err.message,
            details: err.details,
          },
          timestamp: new Date().toISOString(),
        },
        err.statusCode
      );
    }

    return c.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
        timestamp: new Date().toISOString(),
      },
      500
    );
  });

  return app;
}

export { createZarinpalClient } from '../core/index.js';
export type { ZarinpalConfig } from '../core/index.js';

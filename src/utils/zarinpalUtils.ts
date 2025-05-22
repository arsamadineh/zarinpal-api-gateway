import { PaymentRequestSchema } from '../schemas/paymentSchema';
import { HttpError } from './errors/HttpError';

const ZARINPAL_API_URL = 'https://api.zarinpal.com/pg/v4/payment/request.json'; // Replace with the correct Zarinpal API URL
const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID || 'YOUR_ZARINPAL_MERCHANT_ID'; // Replace with your Zarinpal Merchant ID

interface ZarinpalRequestResponse {
  data: {
    authority: string;
    code: number;
  };
  errors: string[];
}

export async function requestPayment(data: PaymentRequestSchema): Promise<{ authority: string; code: number }> {
  try {
    const response = await fetch(ZARINPAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchant_id: MERCHANT_ID,
        amount: data.amount,
        callback_url: data.callback_url,
        description: data.description,
        mobile: data.mobile,
        email: data.email,
      }),
    });

    if (!response.ok) {
      throw new HttpError(500, `Zarinpal request failed with status: ${response.status}`);
    }

    const result: ZarinpalRequestResponse = await response.json();

    if (result.data.code !== 100) {
      throw new HttpError(400, `Zarinpal request failed with code: ${result.data.code}`);
    }

    return { authority: result.data.authority, code: result.data.code };
  } catch (error: any) {
    console.error('Zarinpal request error:', error);
    throw new HttpError(500, error.message || 'Failed to request payment from Zarinpal');
  }
}

// Implement verification, reversal, and inquiry functions similarly

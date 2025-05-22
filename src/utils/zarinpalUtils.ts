// Replace with actual Zarinpal API endpoint
const ZARINPAL_API_URL = 'https://api.zarinpal.com/pg/v4/payment/request.json';

interface ZarinpalResponse {
  data: {
    code: number;
    message: string;
    authority: string;
  };
  errors: {
    code: number;
    message: string;
  } | null;
  status: number;
}

export async function generatePaymentRequest(merchantId: string, amount: number, callbackUrl: string, description: string): Promise<{ status: number; authority: string; errors: any }> {
  try {
    const response = await fetch(ZARINPAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: amount,
        callback_url: callbackUrl,
        description: description,
      }),
    });

    const data: ZarinpalResponse = await response.json();

    if (data.data.code === 100) {
      return { status: data.data.code, authority: data.data.authority, errors: null };
    } else {
      return { status: data.errors?.code || -1, authority: '', errors: data.errors };
    }
  } catch (error: any) {
    console.error("Error calling Zarinpal API:", error);
    throw new Error(`Failed to generate payment request: ${error.message}`);
  }
}

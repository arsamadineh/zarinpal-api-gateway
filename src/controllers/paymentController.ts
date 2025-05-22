import { generatePaymentRequest } from '../utils/zarinpalUtils';

export async function initiatePayment(merchantId: string, amount: number, callbackUrl: string, description: string): Promise<{ redirectUrl: string }> {
  try {
    const paymentResponse = await generatePaymentRequest(merchantId, amount, callbackUrl, description);

    if (paymentResponse.status === 100) {
      return { redirectUrl: `https://www.zarinpal.com/pg/StartPay/${paymentResponse.authority}` };
    } else {
      throw new Error(`Zarinpal payment initiation failed: ${paymentResponse.errors?.message || 'Unknown error'}`);
    }
  } catch (error: any) {
    console.error("Error initiating payment:", error);
    throw new Error(`Failed to initiate payment: ${error.message}`);
  }
}

export async function verifyTransaction(authority: string, amount: number): Promise<{ status: number; refId: string | null }> {
  // TODO: Implement transaction verification logic using Zarinpal's verify API
  // This is a placeholder implementation
  console.log(`Verifying transaction with authority: ${authority}, amount: ${amount}`);
  return { status: 100, refId: '123456' };
}

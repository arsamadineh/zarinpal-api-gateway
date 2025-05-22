import { Request, Response, NextFunction } from 'express';
import { verifyTransaction } from '../controllers/paymentController';

export async function zarinpalCallbackHandler(req: Request, res: Response, next: NextFunction) {
  const { Authority: authority, Status: status } = req.query;

  if (status === 'OK' && authority) {
    try {
      // Assuming the amount is stored in the session or database based on the authority.
      // Replace this with your actual logic to retrieve the amount.
      const amount = 1000; // Example amount

      const verificationResult = await verifyTransaction(authority as string, amount);

      if (verificationResult.status === 100) {
        // Transaction is successful
        console.log("Payment verification successful. RefId:", verificationResult.refId);
        // TODO: Update transaction status in your database
        return res.status(200).json({ message: 'Payment successful', refId: verificationResult.refId });
      } else {
        // Transaction verification failed
        console.error("Payment verification failed.");
        // TODO: Update transaction status in your database
        return res.status(400).json({ error: 'Payment verification failed' });
      }
    } catch (error: any) {
      console.error("Error during payment verification:", error);
      return res.status(500).json({ error: 'Internal server error during payment verification' });
    }
  } else {
    console.warn("Payment failed or was cancelled by user.");
    return res.status(400).json({ error: 'Payment failed or cancelled' });
  }
}

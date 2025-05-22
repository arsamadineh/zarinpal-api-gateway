import { Request, Response } from 'express';
import { ZarinpalPaymentRequest, ZarinpalVerifyPayment } from '../types'; // Assuming you have types defined
import { sendZarinpalRequest, verifyZarinpalPayment } from '../utils/zarinpal'; // Assuming you have a utility for Zarinpal
import { ZodError } from 'zod';
import { PaymentRequestSchema, PaymentVerificationSchema } from '../schemas/payments'; // Assuming you have schemas for payments

export const sendPaymentRequest = async (req: Request, res: Response) => {
  try {
    const validatedData = PaymentRequestSchema.parse(req.body);

    const paymentResponse = await sendZarinpalRequest(validatedData);
    res.status(200).json(paymentResponse);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Failed to send payment request', error: (error as Error).message });
    }
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const validatedData = PaymentVerificationSchema.parse(req.body);

    const verificationResponse = await verifyZarinpalPayment(validatedData);
    res.status(200).json(verificationResponse);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Failed to verify payment', error: (error as Error).message });
    }
  }
};

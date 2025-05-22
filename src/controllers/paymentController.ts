import { Request, Response } from 'express';
import { requestPayment } from '../utils/zarinpalUtils';
import { PaymentRequestSchema } from '../schemas/paymentSchema';
import { asyncHandler } from '../utils/response';

export const paymentController = asyncHandler(async (req: Request, res: Response) => {
  const paymentData: PaymentRequestSchema = req.body;

  const { authority, code } = await requestPayment(paymentData);

  res.status(200).json({ authority, code });
});

import { Request, Response } from 'express';
import { verifyPayment } from '../utils/zarinpalUtils';
import { asyncHandler } from '../utils/response';

export const verificationController = asyncHandler(async (req: Request, res: Response) => {
  const { authority, amount } = req.body;

  const result = await verifyPayment(authority, amount);

  res.status(200).json(result);
});

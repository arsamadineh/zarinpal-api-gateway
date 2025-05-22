import { Request, Response } from 'express';
import { reversePayment } from '../utils/zarinpalUtils';
import { asyncHandler } from '../utils/response';

export const reversalController = asyncHandler(async (req: Request, res: Response) => {
  const { authority } = req.body;

  const result = await reversePayment(authority);

  res.status(200).json(result);
});

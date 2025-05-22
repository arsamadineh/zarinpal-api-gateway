import { Request, Response } from 'express';
import { inquiryPayment } from '../utils/zarinpalUtils';
import { asyncHandler } from '../utils/response';

export const inquiryController = asyncHandler(async (req: Request, res: Response) => {
  const { authority } = req.body;

  const result = await inquiryPayment(authority);

  res.status(200).json(result);
});

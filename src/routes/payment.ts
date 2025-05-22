import express, { Request, Response } from 'express';
import { initiatePayment } from '../controllers/paymentController';
import { paymentSchema } from '../schemas/paymentSchema';
import { validateRequest } from '../middlewares/validationMiddleware';

const router = express.Router();

router.post('/initiate', validateRequest(paymentSchema), async (req: Request, res: Response) => {
  try {
    const { merchantId, amount, callbackUrl, description } = req.body;
    const paymentResult = await initiatePayment(merchantId, amount, callbackUrl, description);
    return res.redirect(paymentResult.redirectUrl);
  } catch (error: any) {
    console.error("Payment initiation error:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;

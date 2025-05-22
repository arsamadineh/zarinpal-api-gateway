import express from 'express';
import { sendPaymentRequest, verifyPayment } from '../controllers/payments';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.post('/payments/request', authenticate, sendPaymentRequest);
router.post('/payments/verify', authenticate, verifyPayment);

export default router;

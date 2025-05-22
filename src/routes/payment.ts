import express from 'express';
import { paymentController } from '../controllers/paymentController';
import { validatePayment } from '../middlewares/zarinpalMiddleware';

const router = express.Router();

router.post('/request', validatePayment, paymentController);

export default router;

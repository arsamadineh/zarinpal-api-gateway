import express from 'express';
import { getTransactions } from '../controllers/transactions';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.get('/terminals/:terminalId/transactions', authenticate, getTransactions);

export default router;

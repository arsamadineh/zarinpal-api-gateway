import express from 'express';
import { reversalController } from '../controllers/reversalController';

const router = express.Router();

router.post('/reverse', reversalController);

export default router;

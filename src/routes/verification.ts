import express from 'express';
import { verificationController } from '../controllers/verificationController';

const router = express.Router();

router.post('/verify', verificationController);

export default router;

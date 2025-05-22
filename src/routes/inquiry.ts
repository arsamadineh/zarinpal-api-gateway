import express from 'express';
import { inquiryController } from '../controllers/inquiryController';

const router = express.Router();

router.post('/inquiry', inquiryController);

export default router;

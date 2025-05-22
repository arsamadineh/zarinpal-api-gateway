import express from 'express';
import { getTerminals } from '../controllers/terminals';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.get('/terminals', authenticate, getTerminals);

export default router;

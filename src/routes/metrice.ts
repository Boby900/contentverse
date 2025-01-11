import express from 'express';
import { getMetrics } from '../controllers/metrice.js';
import { validateSessionTokenHandler } from '../controllers/auth.js';

const router = express.Router();

router.get('/', validateSessionTokenHandler, getMetrics);

export default router;

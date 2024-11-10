import express from 'express';
import { generateSessionToken, createSessionHandler} from '../controllers/auth.js';

const router = express.Router();

router.get('/', generateSessionToken);
router.get('/createSession', createSessionHandler)

export default router;

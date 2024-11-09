import express from 'express';
import {getHome} from '../controllers/main.js';
import { generateSessionToken, createSessionHandler} from '../controllers/auth.js';

const router = express.Router();

router.get('/', generateSessionToken);
router.get('/createSession', createSessionHandler)

export default router;

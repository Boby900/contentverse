import express from 'express';
import { getAllUsers } from '../controllers/user.js';
import { validateSessionTokenHandler } from '../controllers/auth.js';

const router = express.Router();

router.get('/', validateSessionTokenHandler, getAllUsers);


export default router;

import express from 'express';
import {getHome, getDashboard,getProfile, } from '../controllers/main.js';
import { validateSessionTokenHandler } from '../controllers/auth.js';

const router = express.Router();

router.get('/', getHome);
router.get('/dashboard', validateSessionTokenHandler, getDashboard);
router.get('/getProfile', validateSessionTokenHandler, getProfile)

export default router;

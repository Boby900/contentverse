import express from 'express';
import {getHome, getDashboard,getProfile} from '../controllers/main.js';

const router = express.Router();

router.get('/', getHome);
router.get('/dashboard', getDashboard);
router.get('/getProfile', getProfile)

export default router;

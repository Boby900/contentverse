import express from 'express';
import { deleteUserByID, getAllUsers, getUserByID } from '../controllers/user.js';
import { validateSessionTokenHandler } from '../controllers/auth.js';

const router = express.Router();

router.get('/', validateSessionTokenHandler, getAllUsers);
router.get('/by-id',validateSessionTokenHandler, getUserByID);
router.delete('/delete/:id',validateSessionTokenHandler, deleteUserByID);

export default router;

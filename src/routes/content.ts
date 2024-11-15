import express from 'express';
import { getAllContent, getContentByID, updateContentByID, createContent, deleteContentByID } from '../controllers/content.js';
import { validateSessionTokenHandler } from '../controllers/auth.js';
const router = express.Router();

router.get('/', validateSessionTokenHandler, getAllContent);
router.post('/', validateSessionTokenHandler, createContent);
router.get('/:id', validateSessionTokenHandler, getContentByID)
router.put('/:id', validateSessionTokenHandler, updateContentByID)
router.delete('/:id', validateSessionTokenHandler, deleteContentByID)

export default router;

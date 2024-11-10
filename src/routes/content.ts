import express from 'express';
import { getAllContent, getContentByID, updateContentByID, createContent, deleteContentByID } from '../controllers/content.js';

const router = express.Router();

router.get('/', getAllContent);
router.post('/', createContent);
router.get('/:id', getContentByID)
router.put('/:id', updateContentByID)
router.delete('/:id', deleteContentByID)

export default router;

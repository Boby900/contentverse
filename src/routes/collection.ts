import express from 'express';
import { createCollection } from '../controllers/collection';
const router = express.Router();

// router.get('/', validateSessionTokenHandler, getAllContent);
router.post('/',  createCollection);
// router.get('/:id', vazlidateSessionTokenHandler, getContentByID)
// router.put('/:id', validateSessionTokenHandler, updateContentByID)
// router.delete('/:id', validateSessionTokenHandler, deleteContentByID)
// router.post('/upload',validateSessionTokenHandler, uploadFile)

export default router;

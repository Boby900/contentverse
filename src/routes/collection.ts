import express from 'express';
import { createCollection } from '../controllers/collection.js';
import { getCollections } from '../controllers/list_collections.js';
import { validateSessionTokenHandler } from '../controllers/auth.js';
const router = express.Router();

// router.get('/', validateSessionTokenHandler, getAllContent);
router.post('/', validateSessionTokenHandler, createCollection);
router.get('/get_collections', validateSessionTokenHandler, getCollections )
// router.get('/:id', vazlidateSessionTokenHandler, getContentByID)
// router.put('/:id', validateSessionTokenHandler, updateContentByID)
// router.delete('/:id', validateSessionTokenHandler, deleteContentByID)
// router.post('/upload',validateSessionTokenHandler, uploadFile)

export default router;

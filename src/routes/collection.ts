import express from 'express';
import { createCollection, deleteCollections, insertCollectionData } from '../controllers/collection.js';
import { getCollections } from '../controllers/collection.js';
import { validateSessionTokenHandler } from '../controllers/auth.js';
const router = express.Router();

// router.get('/', validateSessionTokenHandler, getAllContent);
router.post('/', validateSessionTokenHandler, createCollection);
router.post('/insert', validateSessionTokenHandler, insertCollectionData);
router.get('/get_collections', validateSessionTokenHandler, getCollections )
router.delete('/del_collections/:id', validateSessionTokenHandler, deleteCollections )
// router.get('/:id', vazlidateSessionTokenHandler, getContentByID)
// router.put('/:id', validateSessionTokenHandler, updateContentByID)
// router.delete('/:id', validateSessionTokenHandler, deleteContentByID)
// router.post('/upload',validateSessionTokenHandler, uploadFile)

export default router;

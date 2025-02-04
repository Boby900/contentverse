import express from 'express';
import { createCollection, deleteCollections, deleteRowsOFCollection, getCollectionsByID, insertCollectionData } from '../controllers/collection.js';
import { getCollections } from '../controllers/collection.js';
import { validateSessionTokenHandler } from '../controllers/auth.js';
const router = express.Router();

router.post('/', validateSessionTokenHandler, createCollection);
router.post('/insert', validateSessionTokenHandler, insertCollectionData);
router.get('/get_collections', validateSessionTokenHandler, getCollections )
router.delete('/del_collections/:id', validateSessionTokenHandler, deleteCollections )
router.get('/:id', validateSessionTokenHandler, getCollectionsByID )
router.delete('/:id', validateSessionTokenHandler, deleteRowsOFCollection )


export default router;

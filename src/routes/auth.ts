import express from 'express';
import { signupHandler, loginHandler, logoutHandler, validateSessionTokenHandler} from '../controllers/auth.js';

const router = express.Router();
router.post('/signup', signupHandler); // Handles user signup
router.post('/login', loginHandler);   // Handles user login and session creation
router.post('/logout', logoutHandler);
router.post('/validate', validateSessionTokenHandler);
// router.get('/', generateSessionToken);
// router.get('/createSession', createSessionHandler)

  
export default router;

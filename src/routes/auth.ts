import express from 'express';
import { signupHandler, loginHandler, logoutHandler, githubHandler ,validateSessionTokenHandler, githubCallBack} from '../controllers/auth.js';

const router = express.Router();
router.post('/signup', signupHandler); // Handles user signup
router.post('/login', loginHandler);   // Handles user login and session creation
router.get('/github/login', githubHandler);   
router.get('/github/login/callback', githubCallBack);   
router.post('/logout', logoutHandler);
router.post('/validate', validateSessionTokenHandler);
// router.get('/', generateSessionToken);
// router.get('/createSession', createSessionHandler)

  
export default router;

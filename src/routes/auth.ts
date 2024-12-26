import express from 'express';
import { signupHandler, loginHandler, logoutHandler, validateSessionTokenHandler} from '../controllers/auth.js';
import { githubHandler, githubCallBack } from '../controllers/github.js';
import { googleCallBack, googleHandler } from '../controllers/google.js';

const router = express.Router();
router.post('/signup', signupHandler); // Handles user signup
router.post('/login', loginHandler);   // Handles user login and session creation
router.get('/github/login', githubHandler);   
router.get('/github/login/callback', githubCallBack);   
router.get('/github/login/google', googleHandler);   
router.get('/github/login/google/callback', googleCallBack);   
router.post('/logout', logoutHandler);
router.post('/validate', validateSessionTokenHandler);


  
export default router;

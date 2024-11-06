
import express from 'express';
import {getUser} from '../controllers/user.js';

const router = express.Router();

router.get('/', getUser);
// router.get("/login", mainController.getLogin);
// router.post("/login", mainController.postLogin);
// router.get("/logout", mainController.logout);
// router.get("/signup", mainController.getSignup);
// router.post("/signup", mainController.postSignup);

export default router;


import express from 'express';
import {getHome} from '../controllers/main.js';

const router = express.Router();

router.get('/', getHome);
// router.get("/login", mainController.getLogin);
// router.post("/login", mainController.postLogin);
// router.get("/logout", mainController.logout);
// router.get("/signup", mainController.getSignup);
// router.post("/signup", mainController.postSignup);

export default router;

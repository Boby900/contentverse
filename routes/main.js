const express = require('express');
const mainController = require('../controllers/main')
const router = express.Router();

router.get('/', mainController.getHome);
// router.get("/login", mainController.getLogin);
// router.post("/login", mainController.postLogin);
// router.get("/logout", mainController.logout);
// router.get("/signup", mainController.getSignup);
// router.post("/signup", mainController.postSignup);

module.exports = router;

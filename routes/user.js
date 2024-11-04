const express = require('express');
// const userController = require('../controllers/userController');
const userController = require('../controllers/user')

const router = express.Router();

router.get('/', userController.getUser);
// router.get('/profile', userController.getProfile);


module.exports = router;

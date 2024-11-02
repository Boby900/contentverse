const express = require('express');
// const userController = require('../controllers/userController');
const userController = require('../controllers/user')

const router = express.Router();

router.get('/', userController.getUser);

module.exports = router;

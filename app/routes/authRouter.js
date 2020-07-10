const express = require('express');

const AuthController = require('./../controllers/authController');

const router = express.Router();

router.route('/register')
      .post(AuthController.register);

router.route('/login')
      .get(AuthController.login);

module.exports = router;
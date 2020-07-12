const express = require('express');

const AuthController = require('./../controllers/authController');
const Request = require('./../utils/request');

const router = express.Router();

router.route('/register')
  	.post(
	  Request.filterBody(
		  'name', 'photo', 
		  'email', 'password', 
		  'passwordConfirm'
		),
	  AuthController.register
	);

router.route('/login')
	.post(
	  Request.filterBody('email', 'password'),
	  AuthController.login
	);

router.route('/forgotPassword')
	.post(
	  Request.filterBody('email'),
	  AuthController.forgotPassword
	);

router.route('/resetPassword/:token')
	.patch(
	  Request.filterBody('password', 'passwordConfirm'),
	  AuthController.resetPassword
	);

module.exports = router;
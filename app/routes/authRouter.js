const express = require('express');

const AuthController = require('./../controllers/authController');
const Request = require('./../utils/request');

const router = express.Router();

router.route('/register')
  	.post(
	  Request.filterBody([
		  'name', 'username', 
		  'email', 'password', 
		  'passwordConfirm']),
	  AuthController.register
	);

router.route('/login')
	.post(
	  Request.filterBody([ 'email', 'password' ]),
	  AuthController.login
	);

router.route('/forgotPassword')
	.post(
	  Request.filterBody([ 'email' ]),
	  AuthController.forgotPassword
	);

module.exports = router;
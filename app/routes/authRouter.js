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

module.exports = router;
const express = require('express');
const UserController = require('./../controllers/userController');
const AuthMiddleware = require('./../middlewares/authMiddleware');
const Request = require('./../utils/request');

const router = express.Router();

router.route('/')
      .get(
        AuthMiddleware.allowedTo('admin'),
        Request.querySeparator,
        UserController.getUsers
      );

module.exports = router;
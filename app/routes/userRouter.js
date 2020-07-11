const express = require('express');
const UserController = require('./../controllers/userController');
const AuthMiddleware = require('./../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
      .get(
        AuthMiddleware.allowedTo('admin'),
        UserController.getUsers
      );

module.exports = router;
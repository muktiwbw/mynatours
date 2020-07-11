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

router.route('/updateMe')
      .patch(
        AuthMiddleware.allowedTo('user'),
        Request.filterBody('name', 'username', 'email'),
        UserController.updateMe
      );
      
router.route('/updatePassword')
      .patch(
        AuthMiddleware.allowedTo('user'),
        Request.filterBody('currPassword', 'newPassword', 'newPasswordConfirm'),
        UserController.updatePassword
      );

router.route('/deleteMe')
      .delete(
        AuthMiddleware.allowedTo('user'),
        UserController.deleteMe
      );

module.exports = router;
const express = require('express');
const UserController = require('./../controllers/userController');
const AuthMiddleware = require('./../middlewares/authMiddleware');
const { upload } = require('./../middlewares/fileMiddleware');
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
        upload.single('photo'),
        Request.filterBody('name', 'photo', 'email'),
        UserController.updateMe
      );
      
router.route('/updatePassword')
      .patch(
        Request.filterBody('currPassword', 'newPassword', 'newPasswordConfirm'),
        UserController.updatePassword
      );

router.route('/deleteMe')
      .delete(
        AuthMiddleware.allowedTo('user'),
        UserController.deleteMe
      );

module.exports = router;
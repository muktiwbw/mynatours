const express = require('express');
const UserController = require('./../controllers/userController');
const AuthMiddleware = require('./../middlewares/authMiddleware');
const { upload } = require('./../middlewares/fileMiddleware');
const Request = require('./../utils/request');

const router = express.Router({ mergeParams: true });

router.route('/')
      .get(
        AuthMiddleware.allowedTo('admin'),
        Request.querySeparator,
        UserController.getUsers
      );

router.route('/updateMe')
      .patch(
        upload.single('photo'),
        Request.filterBody('name', 'email'),
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
      
router.route('/addToFavourites')
      .post(
        AuthMiddleware.allowedTo('user'),
        UserController.addToFavourites
      );

router.route('/removeFromFavourites')
      .post(
        AuthMiddleware.allowedTo('user'),
        UserController.removeFromFavourites
      );

module.exports = router;
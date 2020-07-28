const express = require('express');
const ViewController = require('./../controllers/viewController');
const AuthMiddleware = require('./../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
      .get(AuthMiddleware.isLoggedIn, ViewController.getAllTours);

router.route('/me')
      .get(AuthMiddleware.isLoggedIn, ViewController.getMe);

router.route('/me/favourites')
      .get(
            AuthMiddleware.isLoggedIn,
            AuthMiddleware.allowedToWeb('user'), 
            ViewController.getAllFavourites
      );

router.route('/me/reviews')
      .get(
            AuthMiddleware.isLoggedIn,
            AuthMiddleware.allowedToWeb('user'), 
            ViewController.getAllReviews
      );

router.route('/manage/tours')
      .get(
            AuthMiddleware.isLoggedIn,
            AuthMiddleware.allowedToWeb('admin'),
            ViewController.manageTours
      );

router.route('/manage/tours/new')
      .get(
            AuthMiddleware.isLoggedIn,
            AuthMiddleware.allowedToWeb('admin'),
            ViewController.addTours
      );

router.route('/manage/tours/:tourId')
      .get(
            AuthMiddleware.isLoggedIn,
            AuthMiddleware.allowedToWeb('admin'),
            ViewController.manageToursById
      );

router.route('/tours/:slug')
      .get(AuthMiddleware.isLoggedIn, ViewController.getOneTour);

router.route('/logout')
      .get(AuthMiddleware.isLoggedIn, ViewController.logout);

router.route('/login')
      .get(AuthMiddleware.allowedToWeb('guest'), ViewController.getLoginForm);

router.route('/register')
      .get(AuthMiddleware.allowedToWeb('guest'), ViewController.getRegisterForm);

module.exports = router;
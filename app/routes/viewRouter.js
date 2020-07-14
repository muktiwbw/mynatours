const express = require('express');
const ViewController = require('./../controllers/viewController');

const router = express.Router();

router.route('/')
      .get(ViewController.getAllTours);

router.route('/tours/:slug')
      .get(ViewController.getOneTour);

module.exports = router;
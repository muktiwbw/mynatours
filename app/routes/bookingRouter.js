const express = require('express');
const { allowedTo } = require('../middlewares/authMiddleware');
const { filterBody } = require('../utils/request');
const BookingController = require('./../controllers/bookingController');

const router = express.Router({ mergeParams: true });

router.route('/checkout')
      .post(
        allowedTo('user'),
        filterBody('startDate'),
        BookingController.checkout
      );

module.exports = router;
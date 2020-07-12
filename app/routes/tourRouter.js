const express = require('express');
const TourController = require('./../controllers/tourController');
const { allowedTo } = require('./../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
      .post(
        allowedTo('admin'),
        TourController.createOneTour
      );

module.exports = router;
const express = require('express');
const TourController = require('./../controllers/tourController');
const ReviewRouter = require('./../routes/reviewRouter');
const { allowedTo } = require('./../middlewares/authMiddleware');

const router = express.Router();

router.use('/:tourId/reviews', ReviewRouter);

router.route('/')
      .post(
        allowedTo('admin'),
        TourController.createOneTour
      );

module.exports = router;
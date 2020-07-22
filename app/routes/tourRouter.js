const express = require('express');
const TourController = require('./../controllers/tourController');
const ReviewRouter = require('./../routes/reviewRouter');
const { allowedTo } = require('./../middlewares/authMiddleware');
const { filterBody } = require('./../utils/request');
const { upload } = require('../middlewares/fileMiddleware');

const router = express.Router();

router.use('/:tourId/reviews', ReviewRouter);

router.route('/')
      .post(
        upload.array([
          { name: 'cover', maxCount: 1 },
          { name: 'slides', maxCount: 3 }
        ]),
        filterBody(
          'name', 'summary', 'description', 'difficulty', 
          'duration', 'maxGroupSize', 'price', 'startDates',
          'locations', 'startLocation', 'guides'
        ),
        allowedTo('admin'),
        TourController.createOneTour
      );

router.route('/:tourId')
      .patch(
        upload.array([
          { name: 'cover', maxCount: 1 },
          { name: 'slides', maxCount: 3 }
        ]),
        filterBody('name', 'summary', 'description', 'difficulty', 'duration', 'maxGroupSize', 'price'),
        allowedTo('admin'),
        TourController.updateOneTour
      )
      .delete(
        allowedTo('admin'),
        TourController.deleteOneTour
      );

module.exports = router;
const express = require('express');
const TourController = require('./../controllers/tourController');
const ReviewRouter = require('./../routes/reviewRouter');
const BookingRouter = require('./../routes/bookingRouter');
const UserRouter = require('./../routes/userRouter');
const { allowedTo } = require('./../middlewares/authMiddleware');
const { filterBody } = require('./../utils/request');
const { upload } = require('../middlewares/fileMiddleware');

const router = express.Router();

router.use('/:tourId/reviews', ReviewRouter);
router.use('/:tourId/bookings', BookingRouter);
router.use('/:tourId/users', UserRouter);

router.route('/')
      .post(
        upload.fields([
          { name: 'imageCover', maxCount: 1 },
          { name: 'images', maxCount: 3 }
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
        upload.fields([
          { name: 'imageCover', maxCount: 1 },
          { name: 'images', maxCount: 3 }
        ]),
        filterBody(
          'name', 'summary', 'description', 'difficulty', 
          'duration', 'maxGroupSize', 'price', 'startDates',
          'locations', 'startLocation', 'guides'
        ),
        allowedTo('admin'),
        TourController.updateOneTour
      )
      .delete(
        allowedTo('admin'),
        TourController.deleteOneTour
      );

module.exports = router;
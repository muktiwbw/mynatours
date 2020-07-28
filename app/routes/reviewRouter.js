const express = require('express');
const ReviewController = require('./../controllers/reviewController');
const { allowedTo } = require('./../middlewares/authMiddleware');
const { filterBody } = require('./../utils/request');

const router = express.Router({ mergeParams: true });

router.route('/')
      .post(
        allowedTo('user'),
        filterBody('review', 'rating'),
        ReviewController.createOneReview
      );

router.route('/:reviewId')
      .patch(
        allowedTo('user'),
        filterBody('review', 'rating'),
        ReviewController.updateOneReview
      );

router.route('/:reviewId')
      .delete(
        allowedTo('user'),
        ReviewController.deleteOneReview
      );

module.exports = router;
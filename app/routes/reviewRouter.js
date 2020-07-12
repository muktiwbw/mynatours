const express = require('express');
const ReviewController = require('./../controllers/reviewController');
const { allowedTo } = require('./../middlewares/authMiddleware');

const router = express.Router({ mergeParams: true });

router.route('/')
      .post(
        allowedTo('user'),
        ReviewController.createOneReview
      );

module.exports = router;
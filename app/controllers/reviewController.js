const Review = require('./../models/reviewModel');
const Tour = require('./../models/tourModel');
const { catchAsync } = require('./../utils/query');
const db = require('./../utils/db');

const updateTourRating = catchAsync(async (tourId) => {
  /**
   * * If you want to aggregate based on matching foreign key, cast the id
   * * into ObjectId first. Otherwise it won't recognize the data type
   */
  const aggr = [
    {
      $match: { tour: db.Types.ObjectId(tourId) }
    },
    {
      $group: {
        _id: '$tour',
        ratingsQuantity: { $sum: 1 },
        ratingsAverage: { $avg: '$rating' }
      }
    }
  ];

  const stat = await Review.aggregate(aggr);
  let payload;

  if (stat.length > 0) {
    const { ratingsQuantity, ratingsAverage } = stat[0];
    payload = { 
      ratingsQuantity, 
      ratingsAverage: Math.round(ratingsAverage * 10) / 10 
    };
  } else {
    payload = {
      ratingsQuantity: 0,
      ratingsAverage: 0
    };
  }

  await Tour.findByIdAndUpdate(tourId, payload, { runValidators: true });
});

exports.createOneReview = catchAsync(async (req, res, next) => {
  // * 1. Get user id and tour id
  const user = req.user._id;
  const tour = req.params.tourId;

  // * 2. Create review
  const { review, rating } = req.filteredBody;
  const rev = await Review.create({ review, rating, user, tour });

  // * 2.5. Calculate rating quantity and average on tour 
  updateTourRating(tour);

  // * 3. Return
  return res
        .status(201)
        .json({
          status: 'success',
          data: {
            review: rev
          }
        });
});

exports.updateOneReview = catchAsync(async (req, res, next) => {
  // * 1. Get user id and tour id
  const tour = req.params.tourId;
  const reviewId = req.params.reviewId;

  // * 2. Create review
  const { review, rating } = req.filteredBody;
  
  const rev = await Review.findById(reviewId);
  
  const oldRating = rev.rating;

  rev.review = review;
  rev.rating = rating;
  await rev.save();

  // * 2.5. Calculate rating quantity and average on tour 
  if (rating !== oldRating) updateTourRating(tour);

  // * 3. Return
  return res
        .status(201)
        .json({
          status: 'success',
          data: {
            review: rev
          }
        });
});

exports.deleteOneReview = catchAsync(async (req, res, next) => {
  // * 1. Get review id and tour id
  const reviewId = req.params.reviewId;
  const tourId = req.params.tourId;
  
  // * 2. Delete review
  await Review.findByIdAndDelete(reviewId);

  // * 2.5. Calculate rating quantity and average on tour 
  updateTourRating(tourId);

  // * 3. Return
  return res
        .status(204)
        .json({
          status: 'deleted'
        });
});


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

  const { ratingsQuantity, ratingsAverage } = (await Review.aggregate(aggr))[0];

  await Tour.findByIdAndUpdate(tourId, { 
    ratingsQuantity, 
    ratingsAverage: Math.round(ratingsAverage * 10) / 10 
  }, { runValidators: true });
});

exports.createOneReview = catchAsync(async (req, res, next) => {
  // * 1. Get user id and tour id
  const user = req.user._id;
  const tour = req.params.tourId;

  // * 2. Create review
  const { review, rating } = req.body;
  const rev = await Review.create({ review, rating, user, tour });

  // * 2.5. Calculate rating quantity and average on tour 
  updateTourRating(tour);

  // * 3. Return
  return res
        .status(201)
        .json({
          status: 'created',
          data: {
            review: rev
          }
        });
});

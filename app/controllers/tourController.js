const Tour = require('./../models/tourModel');
const { catchAsync } = require('./../utils/query');

exports.createOneTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.create(req.body);

  return res
        .status(201)
        .json({
          status: 'created',
          data: {
            tour
          }
        });
});
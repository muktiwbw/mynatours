const Tour = require('./../models/tourModel');
const { catchAsync } = require('./../utils/query');

exports.createOneTour = catchAsync(async (req, res, next) => {
  const body = {...req.filteredBody};

  body.startLocation = JSON.parse(body.startLocation);
  body.locations = body.locations.map(loc => JSON.parse(loc));

  const tour = await Tour.create(body);

  return res
        .status(201)
        .json({
          status: 'created',
          data: {
            tour,
            body
          }
        });
});

exports.updateOneTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.tourId, req.filteredBody, { new: true, runValidators: true });

  return res
        .status(201)
        .json({
          status: 'updated',
          data: {
            tour
          }
        });
});

exports.deleteOneTour = catchAsync(async (req, res, next) => {
  const { tourId } = req.params;
  const tour = await Tour.findByIdAndDelete(tourId);
  
  return res
        .status(204)
        .json({
          status: 'deleted',
          data: {
            tour
          }
        });
});
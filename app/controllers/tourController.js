const Tour = require('./../models/tourModel');
const { catchAsync } = require('./../utils/query');
const { multiple } = require('./../utils/photo');
const path = require('path');

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
  const body = {...req.filteredBody};

  body.startLocation = JSON.parse(body.startLocation);
  body.locations = body.locations.map(loc => JSON.parse(loc));

  // * First tour update for basic text fields
  const tour = await Tour.findByIdAndUpdate(req.params.tourId, body, { new: true, runValidators: true });

  const fileImageCover = [];
  const fileImages = [];

  /**
   * * Using basic for loop (in this case for..of) because if you have promises in your iterables
   * * and you're awaiting for them you can't use forEach or map function because their scope
   * * is in a sub-function. That way you will only get promises and will need to await
   * * them once again when the loop is completed. 
   * *
   * * Thanks to some guy on YouTube i forgot the name, for this tips. 
   * *
   * * Why do i want to await promises in each iteration? Read below.
   */
  for (const cov of req.files.imageCover) {
    /**
     * * Delay for 1 second so that each upload doesn't have the same name.
     * * Last time i didn't include this, they're overriding each other
     * * and i only got 1 file.
     * *
     * * This will give another 1000 miliseconds on a timestamp.
     * */ 
    await new Promise(resolve => setTimeout(resolve, 1000));

    fileImageCover.push({
      file: cov.buffer,
      filename: `tours/tour-${tour._id}-${Date.now()}${path.extname(cov.originalname)}`,
      oldFile: tour.imageCover ? `tours/${tour.imageCover}` : null
    });
  }

  for (const [i, img] of req.files.images.entries()) {
    // * Delay for 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));

    fileImages.push({
      file: img.buffer,
      filename: `tours/tour-${tour._id}-${Date.now()}${path.extname(img.originalname)}`,
      oldFile: tour.images[i] ? `tours/${tour.images[i]}` : null
    });
  }

  // * Uploading images
  multiple(fileImageCover);
  multiple(fileImages);

  // * Second tour update for filenames
  tour.imageCover = fileImageCover[0].filename.split('/')[1];
  tour.images = fileImages.map(img => img.filename.split('/')[1]);
  await tour.save();

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
const { catchAsync } = require('./../utils/query');
const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');

exports.getAllTours = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  return res.render('home', { 
    title: 'Exciting tours for adventurous people',
    tours 
  });
});

exports.getOneTour = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const tour = await Tour
                      .findOne({ slug })
                      .populate('guides', 'name role photo')
                      .populate({
                        path: 'reviews',
                        populate: { path: 'user', select: 'name photo' }
                      });
                      
  return res.render('tour', { 
    title: tour.name,
    tour
  });
});
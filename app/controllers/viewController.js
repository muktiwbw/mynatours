const { catchAsync } = require('./../utils/query');
const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const { AppError } = require('../utils/error');

exports.getLoginForm = (req, res) => {
  return res.render('login', { title: 'Login' });
};

exports.logout = (req, res) => {
  if (!res.locals.currentUser) return res.redirect('/');

  const cookieOption = {
    expires: new Date(Date.now() + (5 * 1000)),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOption.secure = true;

  res.cookie('jwt', 'logged out', cookieOption);

  return res.redirect('/');
}

exports.getMe = catchAsync(async (req, res, next) => {
  const { _id } = res.locals.currentUser
  const user = await User.findById(_id);

  res.locals.currentUser.email = user.email;
  res.locals.jwt = req.cookies.jwt;

  return res.render('me', { title: 'Me', page: 'me' });
});

exports.getAllTours = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  return res.render('home', { 
    title: 'Exciting tours for adventurous people',
    tours 
  });
});

exports.manageTours = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.locals.jwt = req.cookies.jwt;

  return res.render('manageTours', {
    title: 'Manage tour',
    page: 'manageTours',
    tours
  });
});

exports.addTours = catchAsync(async (req, res, next) => {
  const guides = await User
                        .find({ role: { $in: [ 'guide', 'lead-guide' ] } })
                        .sort('-role');

  res.locals.jwt = req.cookies.jwt;

  return res.render('commitTours', {
    title: 'Add new tour',
    page: 'manageTours',
    guides
  });
});

exports.manageToursById = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId).populate('guides', '_id name role photo');
  const guides = await User
                        .find({ role: { $in: [ 'guide', 'lead-guide' ] } })
                        .sort('-role');

  res.locals.jwt = req.cookies.jwt;

  return res.render('commitTours', {
    title: tour.name,
    page: 'manageTours',
    tour,
    guides
  });
});

const getTourAvailability = (tour) => {
  const aggr = [
    {
      $match: { tour: tour._id }
    },
    {
      $group: {
        _id: '$startDate',
        books: { $sum: 1 }
      }
    },
    {
      $sort: { startDate: 1 }
    }
  ];

  return Booking.aggregate(aggr);
};

exports.getOneTour = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const tour = await Tour
                      .findOne({ slug })
                      .populate('guides', 'name role photo')
                      .populate({
                        path: 'reviews',
                        populate: { path: 'user', select: 'name photo' }
                      });

  const avb = await getTourAvailability(tour._id);
  
  if (!tour) {
    return next(new AppError('Tour not found', 404, true));
  }
  
  res.locals.jwt = req.cookies.jwt;
                      
  return res.render('tour', { 
    title: tour.name,
    tour,
    avb
  });
});
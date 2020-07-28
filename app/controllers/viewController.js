const { catchAsync } = require('./../utils/query');
const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const { AppError } = require('../utils/error');
const mongoose = require('mongoose');

exports.getLoginForm = (req, res) => {
  return res.render('login', { title: 'Login' });
};

exports.getRegisterForm = (req, res) => {
  return res.render('register', { title: 'Register' });
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

exports.getOneTour = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const tour = await Tour
                      .findOne({ slug })
                      .populate('guides', 'name role photo')
                      .populate({
                        path: 'reviews',
                        populate: { 
                          path: 'user', 
                          select: '_id name photo',
                          match: { _id: mongoose.Types.ObjectId(res.locals.currentUser._id) }
                        }
                      })
                      .populate({
                        path: 'bookings',
                        match: { user: mongoose.Types.ObjectId(res.locals.currentUser._id) }
                      });
  
  if (!tour) {
    return next(new AppError('Tour not found', 404, true));
  }

  const isFavourite = (await User.findById(res.locals.currentUser._id)).favourites.map(fv => fv._id).includes(tour._id);
  const hasBooked = tour.bookings.length > 0;
  const hasReviewed = tour.reviews.length > 0;

  res.locals.jwt = req.cookies.jwt;
                      
  return res.render('tour', { 
    title: tour.name,
    tour,
    isFavourite,
    hasBooked,
    hasReviewed
  });
});

exports.getAllFavourites = catchAsync(async (req, res, next) => {
  const favs = (await User.findById(res.locals.currentUser._id)).favourites;

  res.locals.jwt = req.cookies.jwt;

  return res.render('favourites', {
    title: 'My favourites',
    favs,
    page: 'meFavs'
  });
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const revs = (await User.findById(res.locals.currentUser._id).populate({
    path: 'reviews', 
    populate: { path: 'tour', select: '_id name slug' }
  })).reviews;

  res.locals.jwt = req.cookies.jwt;

  return res.render('reviews', {
    title: 'My reviews',
    revs,
    page: 'meRevs'
  });
});
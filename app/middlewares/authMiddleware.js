const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { AppError } = require('../utils/error');
const User = require('./../models/userModel');

exports.authenticate = async (req, res, next) => {
  // * 1. Check if token is provided
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    return next(new AppError('Missing access token', 401));
  }

  // * 2. Verify token
  const token = req.headers.authorization.split(' ')[1];
  const { _id, iat } = await promisify(jwt.verify)(token, process.env.APP_SECRET);

  // * 3. Check if user still exists
  const user = await User.findById({ _id }).select('+passwordUpdatedAt');

  if (!user) {
    return next(new AppError('The account you\'re trying to login currently doesn\'t exist', 400));
  }

  // * 4. Check if token's issued time is LATER than password's updated time
  const lastPasswordUpdate = parseInt(new Date(user.passwordUpdatedAt).getTime() / 1000);

  if (iat <= lastPasswordUpdate) {
    return next(new AppError('You just\'ve changed your password. Please re-login', 401));
  }

  // * 5. Inject user object to req
  const { name, photo, role } = user;
  req.user = { _id, name, photo, role };

  // * 6. Next
  next();
};

exports.allowedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You don\'t have permission to access this endpoint', 401));
    }

    next();
  };
};
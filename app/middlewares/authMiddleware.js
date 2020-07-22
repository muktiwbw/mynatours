const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { AppError } = require('../utils/error');
const User = require('./../models/userModel');

// * This middleware is for APIs. Use isLoggedIn instead for web request.
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

/**
 * * This middleware is for web request. It simply doesn't assign req.locals.currentUser 
 * * if one of these steps fails.
 * 
 */
exports.isLoggedIn = async (req, res, next) => {
  try {
    // * 1. Check if token is provided by cookie
    // * note: maybe i can add flash message via req.locals.flash
    if (!req.cookies.jwt) return next();

    // * 2. Verify token
    const token = req.cookies.jwt;
    const { _id, iat } = await promisify(jwt.verify)(token, process.env.APP_SECRET);

    // * 3. Check if user still exists
    const user = await User.findById({ _id }).select('+passwordUpdatedAt');

    if (!user) return next();

    // * 4. Check if token's issued time is LATER than password's updated time
    const lastPasswordUpdate = parseInt(new Date(user.passwordUpdatedAt).getTime() / 1000);

    if (iat <= lastPasswordUpdate) return next();

    /**
     * * 5. Inject user object to res.locals
     * * This is so that the template engine can access the variable
     * * just by using currentUser
     */

    const { name, photo, role } = user;
    res.locals.currentUser = { _id, name, photo, role };  
  } catch (error) {
    /**
     * * If there's an error on token veirification or something else,
     * * just simply do nothing. 
     * * Once the error is caught, then the code
     * * will never reach the currentUser assignment.
     * * That way it will never pass the currentUser checking process.
     */
    return next();  
  }

  // * 6. Next
  next();
};

// * Only for web request
exports.allowedToWeb = (...roles) => {
  return (req, res, next) => {
    let role = 'guest';
    if (res.locals.currentUser && res.locals.currentUser.role) role = res.locals.currentUser.role;

    if (!roles.includes(role)) {
      return role === 'guest' ? res.redirect('/login') : res.redirect('/');
    }

    next();
  };
};

// * Only for APIs
exports.allowedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You don\'t have permission to access this endpoint', 401));
    }

    next();
  };
};
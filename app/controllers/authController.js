const User = require('./../models/userModel');
const { AppError } = require('./../utils/error');
const { catchAsync } = require('./../utils/query');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

exports.register = catchAsync(async (req, res, next) => {
  const { 
    _id, name, 
    username, email, 
    role, createdAt 
  } = await User.create(req.filteredBody);

  const token = await promisify(jwt.sign)(
    { _id }, 
    process.env.APP_SECRET, 
    { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN }
  );

  return res
        .status(201)
        .json({
          status: 'created',
          data: {
            token,
            user: {
              _id, name, 
              username, email, 
              role, createdAt 
            }
          }
        });
});

exports.login = catchAsync(async (req, res, next) => {
  // * 1. Check if email and password are provided
  if (!req.filteredBody.email || !req.filteredBody.password) return next(new AppError('Missing email or password', 400));

  // * 2. Get user
  const { email, password } = req.filteredBody;
  const user = await User.findOne({ email }).select('+password');

  // * 3. Check if user exist and password match
  if (!user || !(await user.passwordMatches(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // * 3.5 Deconstruct _id from user
  const { _id } = user;

  // * 4. Sign a token
  const token = await promisify(jwt.sign)({ _id }, process.env.APP_SECRET, { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN });
  
  // * 4.5 Generate a cookie
  const cookieOption = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOption.secure = true;

  // * 5. Return
  res.cookie('jwt', token, cookieOption);
  return res
        .status(200)
        .json({
          status: 'success',
          data: {
            token
          }
        });
});
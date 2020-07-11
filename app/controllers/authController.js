const User = require('./../models/userModel');
const { AppError } = require('./../utils/error');
const { catchAsync } = require('./../utils/query');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const mailer = require('./../utils/mailer');

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

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // * 1. Check if email is provided
  if (!req.filteredBody.email) return next(new AppError('Missing email field', 400));

  // * 2. Check if user exists
  const { email } = req.filteredBody;
  const user = await User.findOne({email});

  if (!user) return next(new AppError('User with that email does\'t exist', 400));

  // * 3. Sign a token
  const { _id } = user;
  const token = await promisify(jwt.sign)(
    { _id }, 
    process.env.APP_SECRET, 
    { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN }
  );

  // * 4. Send email
  await mailer.send({
    from: process.env.MAIL_ADDRESS,
    to: email,
    subject: 'Reset Password',
    text: `To reset your password, please send a PATCH request to /auth/resetPassword/${token}`
  });

  // * 5. Return
  return res
        .status(200)
        .json({
          status: 'success',
          message: 'Reset token has been sent to your email'
        });
});
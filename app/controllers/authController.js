const User = require('./../models/userModel');
const { AppError } = require('./../utils/error');
const { catchAsync } = require('./../utils/query');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const mailer = require('./../utils/mailer');

exports.register = catchAsync(async (req, res, next) => {
  const { 
    _id, name, 
    photo, email, 
    role, createdAt 
  } = await User.create(req.filteredBody);

  const token = await promisify(jwt.sign)({ _id }, process.env.APP_SECRET);
  
  await mailer.send({
    from: process.env.MAIL_ADDRESS,
    to: email,
    subject: 'Email Verification',
    html: `To verify your email, please visit this link: <a href="http://127.0.0.1:3000/verifyEmail/${token}">Verify email.</a>`
  });

  return res
        .status(201)
        .json({
          status: 'created',
          message: 'You\'re successfully registered. Please check your email for verification.',
          data: {
            user: {
              _id, name, 
              photo, email, 
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

  // * 3.25. Check if email is verified
  if (!user.emailVerified) {
    return next(new AppError('Your email is not verified. Please check your inbox.', 400));
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
  const user = await User.findOne({ email }).select('+passwordUpdatedAt');

  if (!user) return next(new AppError('User with that email does\'t exist', 400));

  // * 2.5 Return the user if they do this twice in 24 hours
  const nextPasswordUpdate = new Date(user.passwordUpdatedAt).getTime() + (24 * 3600 * 1000);
  const now = new Date(Date.now()).getTime()

  if (now <= nextPasswordUpdate) return next(new AppError('You can only reset password once every 24 hours', 400))

  // * 3. Sign a token
  const { _id } = user;
  const token = await promisify(jwt.sign)(
    { _id }, 
    process.env.APP_SECRET, 
    { expiresIn: process.env.JWT_RESET_PASSWORD_EXPIRES_IN }
  );

  // * 4. Send email
  await mailer.send({
    from: process.env.MAIL_ADDRESS,
    to: email,
    subject: 'Reset Password',
    html: `To reset your password, please visit this link: <a href="http://127.0.0.1:3000/resetPassword/${token}">Reset password.</a>`
  });

  // * 5. Return
  return res
        .status(200)
        .json({
          status: 'success',
          message: 'Reset token has been sent to your email'
        });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // * 1. If token params and new password and passwordConfirm is provided
  if (!req.filteredBody.token) return next(new AppError('Missing reset token', 400));
  if (!req.filteredBody.password || !req.filteredBody.passwordConfirm) {
    return next(new AppError('Missing password or password confirm', 400));
  }

  // * 2. Verify token => get the payload which is the user ID
  const { _id } = await promisify(jwt.verify)(req.filteredBody.token, process.env.APP_SECRET);

  // * 3. Check if user exists
  const user = await User.findById(_id).select('+passwordUpdatedAt');

  if (!user) {
    return next(new AppError('The user you\'re trying to update currently doesn\'t exist', 404));
  }
  
  // * 3.5 Return the user if they do this twice in 24 hours
  const nextPasswordUpdate = new Date(user.passwordUpdatedAt).getTime() + (24 * 3600 * 1000);
  const now = new Date(Date.now()).getTime()

  if (now <= nextPasswordUpdate) {
    return next(new AppError('You can only reset password once every 24 hours', 400))
  }

  // * 4. Update password => update lastPassswordUpdate as well
  const { password, passwordConfirm } = req.filteredBody;
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  // * 5. Access token
  const token = await promisify(jwt.sign)(
    { _id },
    process.env.APP_SECRET,
    { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN }
  );

  // * 6. Return
  return res
        .status(201)
        .json({
          status: 'updated',
          message: 'Your password has already been updated',
          data: {
            token
          }
        });
});
const User = require('./../models/userModel');
const { catchAsync, QueryBuilder } = require('./../utils/query');
const { AppError } = require('./../utils/error');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const path = require('path');
const { avatar } = require('./../utils/photo');

exports.getUsers = catchAsync(async (req, res, next) => {
  const { extraQuery } = req;

  const users = await new QueryBuilder(User)
                      .filter()
                      .select('name photo email role createdAt')
                      .paginate(extraQuery)
                      .get();

  return res
        .status(200)
        .json({
          status: 'success',
          users: users.length,
          data: {
            users
          }
        });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // * 1. Get user id from request
  const { _id, role } = req.user;

  const body = { ...req.filteredBody };

  if (req.file) {
    // * 1.5 Generate user image filename
    const filename = `${role}-${_id}-${Date.now()}${path.extname(req.file.originalname)}`;
    
    await avatar(req.file, filename, req.user.photo);

    body.photo = filename;
  }

  // * 2. Find and update
  const user = await User.findByIdAndUpdate(_id, body, { new: true, runValidators: true });

  // * 3. Return
  const { name, email, photo } = user;
  return res
        .status(201)
        .json({
          status: 'updated',
          data: {
            user: { name, photo, email }
          }
        });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  // * 1. Get user id from request
  const { _id } = req.user;

  // * 2. Find and update active to false
  const user = await User.findByIdAndUpdate(_id, { active: false }, { new: true });

  // * 3. Return
  const { name, photo, email } = user;
  return res
        .status(204)
        .json({
          status: 'deleted',
          data: {
            user: { name, photo, email }
          }
        });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // * 1. Check if current password, new password, new password confirm is provided
  const { currPassword, newPassword, newPasswordConfirm } = req.filteredBody;

  if (!currPassword || !newPassword || !newPasswordConfirm) {
    return next(new AppError('Missing current password, new password, or new password confirm', 400));
  }

  // * 2. Get user by id
  const { _id } = req.user;
  const user = await User.findById(_id).select('+password');

  // * 3. Check if current password is correct
  const { password } = user;

  if (!(await user.passwordMatches(currPassword, password))) {
    return next(new AppError('Incorrect password', 400));
  }

  // * 4. Update
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save();
  
  /**
   * * 4.5 Delay for 1 second so that the token issued time 
   * * is 1 second longer than passwordUpdatedAt time
   * */ 
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // * 5. Sign token
  const token = await promisify(jwt.sign)(
    { _id },
    process.env.APP_SECRET,
    { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN }
  );

  // * 5.5 Generate a cookie
  const cookieOption = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOption.secure = true;

  res.cookie('jwt', token, cookieOption);

  // * 6. Return
  return res
        .status(201)
        .json({
          status: 'updated',
          message: 'Your password has successfully been updated',
          data: {
            token
          }
        });
});

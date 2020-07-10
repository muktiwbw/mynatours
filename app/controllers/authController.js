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
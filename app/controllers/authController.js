const User = require('./../models/userModel');
const { AppError } = require('./../utils/error');
const { catchAsync } = require('./../utils/query');

exports.register = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);

  return res
        .status(201)
        .json({
          status: 'created',
          data: {
            user: user
          }
        });
});

exports.login = (req, res) => {
  return res.status(200).json({ message: 'Hello from login router!' });
}
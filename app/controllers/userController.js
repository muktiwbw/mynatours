const { catchAsync } = require('./../utils/query');
const User = require('./../models/userModel');

exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select('name username email role createdAt');

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
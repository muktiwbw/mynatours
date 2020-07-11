const User = require('./../models/userModel');
const { catchAsync, QueryBuilder } = require('./../utils/query');

exports.getUsers = catchAsync(async (req, res, next) => {
  const { extraQuery } = req;

  const users = await new QueryBuilder(User)
                      .filter()
                      .select('name username email role createdAt')
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
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
  }
}

exports.AppError = AppError;

exports.globalErrorHandler = (err, req, res, next) => {
  return res
          .json({
            message: err.message,
            err
          });
};
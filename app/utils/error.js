class AppError extends Error {
  constructor(message, statusCode = 500, isRendered = false) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.isRendered = isRendered;
  }
}

exports.AppError = AppError;

exports.globalErrorHandler = (err, req, res, next) => {
  if (err.isRendered) {
    return res.status(err.statusCode || 500).render('error', { title: 'Error', message: err.message });
  }

  console.log(err);
  
  return res
          .status(err.statusCode || 500)
          .json({
            message: err.message,
            err
          });
};
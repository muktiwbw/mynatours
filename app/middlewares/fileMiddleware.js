const multer = require('multer');
const { AppError } = require('../utils/error');

exports.upload = multer({
  fileFilter: function(req, file, next) {
    if (!file.mimetype.startsWith('image/')) {
      return next(new AppError('Only accepts image file', 400), false);
    }
    next(null, true);
  }
});
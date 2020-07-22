const multer = require('multer');
const { AppError } = require('../utils/error');

exports.upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: function(req, file, next) {
    if (!file.mimetype.startsWith('image/')) {
      return next(new AppError('Only accepts image file'), false);
    }

    next(null, true);
  }
});
const db = require('./../utils/db');

const schema = new db.Schema({
  review: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    required: [ true, 'Missing rating field' ],
    min: 0,
    max: 5
  },
  user: {
    type: db.Schema.ObjectId,
    ref: 'User'
  },
  tour: {
    type: db.Schema.ObjectId,
    ref: 'Tour'
  }
});

schema.index({ tour: 1, user: 1 }, { unique: true });

module.exports = db.model('Review', schema, 'reviews');
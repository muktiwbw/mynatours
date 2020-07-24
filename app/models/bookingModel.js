const db = require('./../utils/db');

const schema = new db.Schema({
  user: {
    type: db.Schema.ObjectId,
    ref: 'User',
    required: [ true, 'A booking must have a user' ]
  },
  tour: {
    type: db.Schema.ObjectId,
    ref: 'Tour',
    required: [ true, 'A booking must have a tour' ]
  },
  startDate: {
    type: Date,
    required: [ true, 'A booking must have a start date' ]
  },
  price: {
    type: Number,
    required: [ true, 'A booking must have a price' ]
  }
});

schema.index({ tour: 1, user: 1 }, { unique: true });

module.exports = db.model('Booking', schema, 'bookings');
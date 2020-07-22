const db = require('./../utils/db');
const slugify = require('slugify');
const { AppError } = require('../utils/error');

const schema = new db.Schema({
  name: {
    type: String,
    required: [ true, 'Missing name field' ],
    trim: true,
    unique: true,
    minlength: 2,
    maxlength: 20
  },
  duration: {
    type: Number,
    required: [ true, 'Missing duration field' ],
    min: [ 1, 'Duration needs to be at least 1' ]
  },
  maxGroupSize: {
    type: Number,
    required: [ true, 'Missing max group size field' ],
    min: [ 1, 'Max group size needs to be at least 1' ]
  },
  difficulty: {
    type: String,
    required: [ true, 'Missing difficulty field' ],
    enum: [ 'easy', 'medium', 'difficult' ]
  },
  price: {
    type: Number,
    required: [ true, 'Missing price field' ],
    min: [ 0, 'Price can\'t be lower than 0' ]
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function(val) { return val <= this.price },
      message: 'Discount can\'t be greater than original price'
    }
  },
  summary: {
    type: String,
    required: [ true, 'Missing summary field' ],
    trim: true,
    minlength: 4,
    maxlength: 100
  },
  description: {
    type: String,
    required: [ true, 'Missing description field' ],
    trim: true,
    minlength: 4
  },
  slug: String,
  imageCover: {
    type: String,
    trim: true
  },
  images: {
    type: [ String ],
    trim: true
  },
  ratingsAverage: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  startDates: [ Date ],
  startLocation: {
    type: {
      type: String,
      enum: [ 'Point' ],
      default: 'Point'
    },
    coordinates: [ Number ],
    address: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  },
  locations: [{
    type: {
      type: String,
      enum: [ 'Point' ],
      default: 'Point'
    },
    coordinates: [ Number ],
    address: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    day: {
      type: Number,
      min: [ 1, 'Day needs to be at least 1' ]
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now()
  },
  guides: [{
    type: db.Schema.ObjectId,
    ref: 'User'
  }]
}, { 
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
 });

schema.pre('save', function(next) {
  if (this.isModified('name')) this.slug = slugify(this.name, { lower: true });
  if (this.isModified('locations')) {
    this.locations.forEach(loc => {
      if (loc.day > this.duration) return next(new AppError('Day can\'t be greater than duration', '400'));
    });
  }

  next();
});

schema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'tour',
  options: { limit: 5 }
});

module.exports = db.model('Tour', schema, 'tours');
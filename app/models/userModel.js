const db = require('./../utils/db');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const schema = new db.Schema({
  name: {
    type: String,
    required: [true, 'Missing name field'],
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: [true, 'Missing email field'],
    trim: true,
    unique: true,
    validate: {
      validator: val => validator.isEmail(val),
      message: 'Invalid email address'
    }
  },
  password: {
    type: String,
    required: [true, 'Missing password field'],
    minlength: [8, 'Password length must be at least 8 characters'],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Missing password confirm field'],
    validate: {
      validator: function(val) { return val === this.password },
      message: 'Passwords don\'t match'
    },
    select: false
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    default: 'user'
  },
  active: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  passwordUpdatedAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  favourites: [{
    _id: { type: db.Schema.ObjectId, required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    addedDate: { type: Date, required: true, default: Date.now() }
  }]
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

schema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
    this.passwordConfirm = undefined;
    this.passwordUpdatedAt = Date.now();
  }

  next();
});

schema.pre(/^find/, function(next) {
  this.find({ active: true });

  next();
});

schema.methods.passwordMatches = (string, hash) => {
  return bcrypt.compare(string, hash);
};

schema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'user'
});

schema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'user',
  options: { 
    sort: { createdAt: -1 }
   }
});

module.exports = db.model('User', schema, 'users');
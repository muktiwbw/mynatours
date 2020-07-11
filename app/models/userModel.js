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
  username: {
    type: String,
    required: [true, 'Missing username field'],
    trim: true,
    minlength: 4,
    maxlength: 20,
    unique: true
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
  role: {
    type: String,
    default: 'user'
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  passwordUpdatedAt: {
    type: Date,
    default: Date.now(),
    select: false
  }
})

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

module.exports = db.model('User', schema, 'users');
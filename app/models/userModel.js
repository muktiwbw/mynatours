const db = require('./../utils/db');
const validator = require('validator');

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
    minlength: [8, 'Password length must be at least 8 characters']
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Missing password confirm field'],
    validate: {
      validator: val => val === this.password,
      message: 'Passwords don\'t match'
    }
  }
})

module.exports = db.model('User', schema, 'users');
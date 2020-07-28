const fs = require('fs');
const User = require('./../models/userModel');
const Tour = require('./../models/tourModel');
const Review = require('./../models/reviewModel');
const { catchAsync } = require('./query');
const { promisify } = require('util');
const Booking = require('../models/bookingModel');

const seed = catchAsync(async () => {
  const usersSeed = JSON.parse(await promisify(fs.readFile)(`${__dirname}/../seeds/users.json`, { encoding: 'utf-8' }));
  const toursSeed = JSON.parse(await promisify(fs.readFile)(`${__dirname}/../seeds/tours.json`, { encoding: 'utf-8' }));
  // const reviewsSeed = JSON.parse(await promisify(fs.readFile)(`${__dirname}/../seeds/reviews.json`, { encoding: 'utf-8' }));

  const users = await User.create(usersSeed);
  const tours = await Tour.create(toursSeed);
  // const reviews = await Review.create(reviewsSeed);

  Promise.all([ 
    users, 
    tours, 
    // reviews 
  ]).then(() => {
    console.log('Database seeding is completed');
    process.exit();
  }).catch((err) => {
    console.log(err);
    process.exit(1);
  });
})

const scoop = catchAsync(async () => {
  const users = await User.deleteMany();
  const tours = await Tour.deleteMany();
  // const reviews = await Review.deleteMany();
  const bookings = await Booking.deleteMany();

  Promise.all([ 
    users, 
    tours, 
    // reviews,
    bookings
  ]).then(() => {
    console.log('Database scooping is completed');
    process.exit();
  }).catch((err) => {
    console.log(err);
    process.exit(1);
  });
});

if (process.argv[2] === 'seed') {
  seed();
} else if (process.argv[2] === 'scoop') {
  scoop();
} else {
  console.log(`Invalid flag: ${process.argv[2]}`);
  process.exit();
}
const fs = require('fs');
const User = require('./../models/userModel');
const Tour = require('./../models/tourModel');
const { catchAsync } = require('./query');
const { promisify } = require('util');

const seed = catchAsync(async () => {
  const usersSeed = JSON.parse(await promisify(fs.readFile)(`${__dirname}/../seeds/users.json`, { encoding: 'utf-8' }));
  const toursSeed = JSON.parse(await promisify(fs.readFile)(`${__dirname}/../seeds/tours.json`, { encoding: 'utf-8' }));

  const users = await User.create(usersSeed);
  const tours = await Tour.create(toursSeed);

  Promise.all([ users, tours ]).then(() => {
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

  Promise.all([ users, tours ]).then(() => {
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
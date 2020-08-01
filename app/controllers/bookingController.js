const { catchAsync } = require('./../utils/query');
const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const { AppError } = require('../utils/error');

const getStripeCheckoutSession = async (booking) => {
  const stripeCustomer = await stripe.customers.create({
    email: booking.user.email,
    name: booking.user.name
  });

  const stripeProduct = await stripe.products.create({
    active: true,
    description: booking.tour.summary,
    name: booking.tour.name,
    images: [`https://cosmic-desert-natours.herokuapp.com/${booking.tour.imageCover}`],
    type: 'service'
  });

  return stripe.checkout.sessions.create({
    client_reference_id: `${booking.user._id.toString()}|${booking.tour._id.toString()}|${booking.startDate}`,
    customer: stripeCustomer.id,
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product: stripeProduct.id,
        unit_amount_decimal: booking.tour.price * 100
      },
      quantity: 1
    }],
    mode: 'payment',
    // success_url: `https://cosmic-desert-natours.herokuapp.com/tours/${booking.tour._id}/bookings/create?user=${booking.user._id}&startDate=${booking.startDate}&price=${booking.tour.price}`,
    success_url: `https://cosmic-desert-natours.herokuapp.com/`,
    cancel_url: `https://cosmic-desert-natours.herokuapp.com/tours/${booking.tour.slug}`,
  });
}

exports.checkout = catchAsync(async (req, res, next) => {
  const { startDate } = req.filteredBody;
  const tour = await Tour.findById(req.params.tourId);
  const user = await User.findById(req.user._id);
  const booking = { tour, user, startDate };

  const stripeCheckoutSession = await getStripeCheckoutSession(booking);

  return res
          .status(201)
          .json({
            status: 'created',
            data: {
              stripeCheckoutSessionId: stripeCheckoutSession.id,
              stripePublicKey: process.env.STRIPE_PUBLIC
            }
          });
});

const updateTourStatus = async (booking) => {
  const tour = await Tour.findById(booking.tour);

  startDate = tour.startDates.id(booking.startDate);

  if (!startDate.participants.includes(booking._id)) startDate.participants.push(booking._id);

  if (startDate.participants.length >= tour.maxGroupSize) startDate.isSoldOut = true;
  
  await tour.save();
  
  return tour;
};

exports.createOneBooking = catchAsync(async (req, res, next) => {
  const { tour } = req.params;
  const { startDate, price, user } = req.query;

  const booking = await Booking.create({ tour, user, startDate, price });
  
  const tourStatusUpdated = await updateTourStatus(booking);

  return tourStatusUpdated ? res.redirect('/me') : AppError('There has been an error registering your booking', 500, true);
});

exports.stripeSessionComplete = catchAsync(async (req, res, next) => {
  if (req.body.type !== 'checkout.session.completed') {
    return res.json({ received: false });
  }

  const [ user, tour, startDate ] = req.body.data.object.client_reference_id.split('|');
  const price = req.body.data.object.amount_total / 100;
  const stripeCheckoutSession = req.body.data.object.id;

  const bookingPayload = { user, tour, price, startDate, stripeCheckoutSession };
  
  const booking = await Booking.create(bookingPayload);
  
  const tourStatusUpdated = await updateTourStatus(booking);

  return res.json({ received: tourStatusUpdated ? true : false });
});
const { catchAsync } = require('./../utils/query');
const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET);

const getStripeCheckoutSession = async (booking) => {
  const stripeCustomer = await stripe.customers.create({
    email: booking.user.email,
    name: booking.user.name
  });

  const stripeProduct = await stripe.products.create({
    active: true,
    description: booking.tour.summary,
    name: booking.tour.name,
    images: [
      'https://www.natours.dev/img/tours/tour-2-cover.jpg',
      'https://www.natours.dev/img/tours/tour-2-1.jpg',
      'https://www.natours.dev/img/tours/tour-2-2.jpg',
      'https://www.natours.dev/img/tours/tour-2-3.jpg'
    ],
    type: 'service'
  });

  return stripe.checkout.sessions.create({
    client_reference_id: booking.user._id.toString(),
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
    success_url: `http://127.0.0.1:3000/tours/${booking.tour._id}/bookings/create?user=${booking.user._id}&startDate=${booking.startDate}&price=${booking.tour.price}`,
    cancel_url: `http://127.0.0.1:3000/tours/${booking.tour.slug}`,
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

exports.createOneBooking = catchAsync(async (req, res, next) => {
  const { tour } = req.params;
  const { startDate, price, user } = req.query;

  const booking = await Booking.create({ tour, user, startDate, price });

  if (booking) res.redirect('/me');
});
const path = require('path');
const express = require('express');
// * Routers
const AuthRouter = require('./routes/authRouter');
const UserRouter = require('./routes/userRouter');
const TourRouter = require('./routes/tourRouter');
const ReviewRouter = require('./routes/reviewRouter');
const ViewRouter = require('./routes/viewRouter');
const BookingRouter = require('./routes/bookingRouter');
// * Middlewares
const AuthMiddleware = require('./middlewares/authMiddleware');
const { globalErrorHandler } = require('./utils/error');
const cookieParser = require('cookie-parser');
const compression = require('compression');

// ! Temporary
const BookingController = require('./controllers/bookingController');
// ! ==============================================

const app = express();
const routePrefix = '/api/v1';

// * Compressing response size
app.use(compression({ filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;

      return compression.filter(req, res);
} }));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());

// ! TEMPORARY ====================================
// app.route('/tours/:tour/bookings/create')
//       .get(BookingController.createOneBooking);

app.route('/stripe/session-complete')
      .post(express.raw(), BookingController.stripeSessionComplete);
// ! ==============================================

app.use(ViewRouter);

// * Routes that don't need authentication
app.use(`${routePrefix}/auth`, AuthRouter);

// * Below this middleware are routes that needs authentication
app.use(AuthMiddleware.authenticate);

app.use(`${routePrefix}/tours`, TourRouter);
app.use(`${routePrefix}/users`, UserRouter);
app.use(`${routePrefix}/reviews`, ReviewRouter);
app.use(`${routePrefix}/bookings`, BookingRouter);

// * Global error handler
app.use(globalErrorHandler);

module.exports = app;
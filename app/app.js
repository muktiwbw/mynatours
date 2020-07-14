const path = require('path');
const express = require('express');
// * Routers
const AuthRouter = require('./routes/authRouter');
const UserRouter = require('./routes/userRouter');
const TourRouter = require('./routes/tourRouter');
const ReviewRouter = require('./routes/reviewRouter');
const ViewRouter = require('./routes/viewRouter');
// * Middlewares
const AuthMiddleware = require('./middlewares/authMiddleware');
const { globalErrorHandler } = require('./utils/error');

const app = express();
const routePrefix = '/api/v1';

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(express.json({ limit: '16kb' }));

app.use(ViewRouter);

// * Routes that don't need authentication
app.use(`${routePrefix}/auth`, AuthRouter);

// * Below this middleware are routes that needs authentication
app.use(AuthMiddleware.authenticate);

app.use(`${routePrefix}/tours`, TourRouter);
app.use(`${routePrefix}/users`, UserRouter);
app.use(`${routePrefix}/reviews`, ReviewRouter);

// * Global error handler
app.use(globalErrorHandler);

module.exports = app;
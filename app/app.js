const express = require('express');
const AuthRouter = require('./routes/authRouter');
const UserRouter = require('./routes/userRouter');
const { globalErrorHandler } = require('./utils/error');
const AuthMiddleware = require('./middlewares/authMiddleware');

const app = express();
const routePrefix = '/api/v1';

app.use(express.json({ limit: '16kb' }));

// * Routes that don't need authentication
app.use(`${routePrefix}/auth`, AuthRouter);

// * Below this middleware are routes that needs authentication
app.use(AuthMiddleware.authenticate);

app.use(`${routePrefix}/users`, UserRouter);

// * Global error handler
app.use(globalErrorHandler);

module.exports = app;
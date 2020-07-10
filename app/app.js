const express = require('express');
const AuthRouter = require('./routes/authRouter');
const { globalHandler } = require('./utils/error');

const app = express();
const routePrefix = '/api/v1';

app.use(express.json({ limit: '16kb' }));

app.use(`${routePrefix}/auth`, AuthRouter);

app.use(globalHandler);

module.exports = app;
// This file (app.js) sets up a basic Express server for a project. It includes middleware for logging, parsing JSON, serving static files, and custom middleware for logging request time. It also defines routes for tours and users.all the config of the project is made on app.js

const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');
const { mongo } = require('mongoose');
const reviewRouter = require('./routes/reviewRoutes');
const app = express();

// 1) GLOBAL MIDDLEWARE

// set security HTTP headers
app.use(helmet()); // aways at the start for safety

// DEVELOPMENT LOGGIN
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// limit request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many requests from this IP, please try again in a hour!',
});
app.use('/api', limiter);

// body parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));

// data snitization against NoSQL query injection
app.use(mongoSanitize());

// data sanitization agains XXS
app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAvarage',
      'maxgroupsize',
      'difficulty',
      'price',
    ],
  }),
);

// serving static files
app.use(express.static(`${__dirname}/public`));

// creating our own middleware
// app.use((req, res, next) => {
//   console.log('Hello from the middleware!');
//   next();
// });

// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// 2) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// HANDLING ROUTE NOT FOUND - should aways be the last one
app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server!`, 404));
});

// MIDDLEWARE TO HANDLE ALL ERRORS
app.use(globalErrorHandler);

module.exports = app;

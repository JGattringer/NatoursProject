// This file (app.js) sets up a basic Express server for a project. It includes middleware for logging, parsing JSON, serving static files, and custom middleware for logging request time. It also defines routes for tours and users.all the config of the project is made on app.js

const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// 1) MIDDLEWARE
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// creating our own middleware
// app.use((req, res, next) => {
//   console.log('Hello from the middleware!');
//   next();
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// 2) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// HANDLING ROUTE NOT FOUND - should aways be the last one
app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server!`, 404));
});

// MIDDLEWARE TO HANDLE ALL ERRORS
app.use(globalErrorHandler);

module.exports = app;

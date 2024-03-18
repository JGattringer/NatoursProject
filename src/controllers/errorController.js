const AppError = require('../utils/appError');

const handleCastErrorDb = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.
  `;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((element) => element.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldDb = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);
  const message = `Duplicate Field Value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleJwtError = () =>
  new AppError('Invalid toke, please login again!', 401);

const handleJwtExpiredError = () =>
  new AppError('Your token has expired! Please log in again to have access!');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    messagem: err.message,
    stack: err.stack,
  });
};

const sendErrorProduction = (err, res) => {
  // Operational, trusted errod: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      messagem: err.message,
    });
    // programing or other unknow error: dont leak error details
  } else {
    // 1) log error
    console.error('ERROR', err);

    // 2) Send generic msg
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  //   console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);

    if (error.name === 'CastError') {
      error = handleCastErrorDb(error);
    }
    if (error.code === 11000) error = handleDuplicateFieldDb(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJwtError();
    if (error.name === 'TokenExpiredError') error = handleJwtExpiredError();

    sendErrorProduction(error, res);
  }
};

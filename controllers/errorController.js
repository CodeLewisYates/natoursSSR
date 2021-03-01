const AppError = require('../utils/appError');

const handleJWTExpired = () =>
  new AppError('Your token has expired! Please log in again!', 401);

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value: ${err.keyValue.name}, Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (error, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    res.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: error.stack,
    });
  } else {
    // RENDERED WEBSITE
    console.error('ERROR', error);
    res.status(error.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: error.message,
    });
  }
};

const sendErrorProd = (error, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    // Operational - user generated error, send error feedback to client
    if (error.isOperational) {
      return res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    }
    // send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }

  if (error.isOperational) {
    // RENDERED WEBSITE
    return res.status(error.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: error.message,
    });
  }
  // Programming or other unkown error, don't want to leak details to client
  console.error('ERROR', error);
  return res.status(error.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let err = { ...error };
    if (err.kind === 'ObjectId') err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err._message === 'Validation failed')
      err = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') err = handleJWTError(err);
    if (err.name === 'TokenExpiredError') err = handleJWTExpired(err);
    sendErrorProd(error, req, res);
  }
};

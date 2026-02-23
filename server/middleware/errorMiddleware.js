const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // ✅ 1. Handle Mongoose Duplicate Key Error (e.g., Email or Roll No already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field value entered: ${field}. Please use another value.`;
    statusCode = 400;
  }

  // ✅ 2. Handle Mongoose Validation Errors (e.g., status is not 'Pending', 'Approved', etc.)
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map((val) => val.message).join(', ');
    statusCode = 400;
  }

  // ✅ 3. Handle Mongoose CastError (e.g., invalid Project ID in the URL)
  if (err.name === 'CastError') {
    message = `Resource not found with id of ${err.value}`;
    statusCode = 404;
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };
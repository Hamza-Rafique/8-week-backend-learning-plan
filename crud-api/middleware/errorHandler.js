// Custom error classes for better error handling
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class DatabaseError extends AppError {
  constructor(message) {
    super(message, 500);
    this.name = "DatabaseError";
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404);
    this.name = "NotFoundError";
  }
}

class ValidationError extends AppError {
  constructor(details) {
    super("Validation failed", 400);
    this.name = "ValidationError";
    this.details = details;
  }
}

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error(err);

  // PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        error = new AppError('Duplicate field value entered', 400);
        break;
      case '23503': // foreign_key_violation
        error = new AppError('Referenced resource not found', 400);
        break;
      case '23502': // not_null_violation
        error = new AppError('Required field is missing', 400);
        break;
      case '22P02': // invalid_text_representation
        error = new AppError('Invalid data type provided', 400);
        break;
      default:
        error = new DatabaseError('Database error occurred');
    }
  }

  // Zod validation errors (already formatted)
  if (err.name === 'ZodError') {
    const details = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    error = new ValidationError(details);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(error.details && { details: error.details }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

module.exports = {
  errorHandler,
  AppError,
  DatabaseError,
  NotFoundError,
  ValidationError
};
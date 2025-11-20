/**
 * Global Error Handling Middleware
 * Catches and formats errors consistently across the API
 */

const { performanceMonitor } = require('../utils/performanceMonitor');

/**
 * Error types for better error handling
 */
class APIError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends APIError {
  constructor(message, details = null) {
    super(message, 400);
    this.name = 'ValidationError';
    this.details = details;
  }
}

class NotFoundError extends APIError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

class RateLimitError extends APIError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

class ExternalServiceError extends APIError {
  constructor(service, originalError) {
    super(`External service error: ${service}`, 502);
    this.name = 'ExternalServiceError';
    this.service = service;
    this.originalError = originalError.message;
  }
}

/**
 * Log error for monitoring
 */
function logError(error, req) {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode || 500,
    path: req?.path,
    method: req?.method,
    body: req?.body,
    timestamp: new Date().toISOString()
  };

  // Log to console (in production, send to error tracking service like Sentry)
  console.error('💥 ERROR:', JSON.stringify(errorInfo, null, 2));

  // Track in performance monitor
  if (req) {
    performanceMonitor.recordMetric('errors', {
      duration: 0,
      error: errorInfo,
      timestamp: errorInfo.timestamp
    });
  }
}

/**
 * Determine if error should be reported to user
 */
function isOperationalError(error) {
  if (error instanceof APIError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Format error response
 */
function formatErrorResponse(error, includeStack = false) {
  const response = {
    success: false,
    error: {
      message: error.message || 'An unexpected error occurred',
      statusCode: error.statusCode || 500,
      timestamp: error.timestamp || new Date().toISOString()
    }
  };

  // Add error name if available
  if (error.name) {
    response.error.type = error.name;
  }

  // Add details for validation errors
  if (error instanceof ValidationError && error.details) {
    response.error.details = error.details;
  }

  // Add service info for external service errors
  if (error instanceof ExternalServiceError) {
    response.error.service = error.service;
  }

  // Include stack trace in development
  if (includeStack && process.env.NODE_ENV !== 'production') {
    response.error.stack = error.stack;
  }

  return response;
}

/**
 * Global error handler middleware
 */
function errorHandler(error, req, res, next) {
  // Log the error
  logError(error, req);

  // Determine status code
  const statusCode = error.statusCode || 500;

  // Check if we should include stack trace
  const includeStack = process.env.NODE_ENV !== 'production';

  // Format and send error response
  const errorResponse = formatErrorResponse(error, includeStack);

  res.status(statusCode).json(errorResponse);
}

/**
 * Handle 404 errors (route not found)
 */
function notFoundHandler(req, res, next) {
  const error = new NotFoundError(`Route ${req.method} ${req.path}`);
  next(error);
}

/**
 * Async error wrapper for route handlers
 * Catches async errors and passes to error handler
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Validate request body against schema
 */
function validateRequest(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      throw new ValidationError('Request validation failed', details);
    }

    // Replace req.body with validated value
    req.body = value;
    next();
  };
}

/**
 * Timeout middleware
 */
function timeoutHandler(timeoutMs = 30000) {
  return (req, res, next) => {
    req.setTimeout(timeoutMs, () => {
      const error = new APIError('Request timeout', 408);
      next(error);
    });

    res.setTimeout(timeoutMs, () => {
      const error = new APIError('Response timeout', 408);
      next(error);
    });

    next();
  };
}

module.exports = {
  // Error classes
  APIError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  ExternalServiceError,

  // Middleware
  errorHandler,
  notFoundHandler,
  asyncHandler,
  validateRequest,
  timeoutHandler,

  // Utilities
  logError,
  isOperationalError,
  formatErrorResponse
};

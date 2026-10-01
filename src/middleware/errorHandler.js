const { NODE_ENV } = require('../config/env');

function errorHandler(err, req, res, next) {
  const statusCode = err.status || err.statusCode || 500;

  // Log server errors (5xx) to console for diagnostics; client errors (4xx) are standard HTTP flow
  if (statusCode >= 500) {
    console.error('[synDx Server Error]:', err);
  }

  if (res.headersSent) {
    return next(err);
  }

  const isProduction = NODE_ENV === 'production';

  res.status(statusCode).json({
    error: isProduction && statusCode === 500 ? 'Internal server error.' : (err.message || 'An unexpected error occurred.'),
    ...(isProduction ? {} : { stack: err.stack })
  });
}

module.exports = errorHandler;

// ─── createError ─────────────────────────────────────────────
// A helper to build a proper Error object with a status code.
// Use this in your routes instead of writing res.status().json() directly.
//
// Example:
//   return next(createError(404, 'Expense not found'));
//   return next(createError(400, 'Amount is required'));
//
function createError(status, message) {
  const err = new Error(message); // standard JS Error object
  err.status = status;            // attach the HTTP status code
  return err;
}

// ─── errorHandler ────────────────────────────────────────────
// This is the central error handler for the whole app.
// It must have EXACTLY 4 params — (err, req, res, next).
// Express identifies error middleware by the 4-param signature.
//
// Mount this LAST in index.js, after all routes:
//   app.use(errorHandler);
//
function errorHandler(err, req, res, next) {
  const status  = err.status  || 500;                  // default to 500 if no status
  const message = err.message || 'Internal server error';

  // Log to console so you can see errors while developing
  console.error(`[${status}] ${message}`);

  res.status(status).json({
    error: {
      message,
      status,
    },
  });
}

module.exports = { createError, errorHandler };
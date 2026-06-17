import { ZodError } from 'zod';
import AppError from '../utils/AppError.js';

function notFound(_req, res) {
  res.status(404).json({ message: 'Route not found' });
}

// Centralized error handler. Maps known error types to the contract responses.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation errors',
      errors: err.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      })),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Duplicate key (e.g. unique email) safety net.
  if (err && err.code === 11000) {
    return res.status(409).json({ message: 'Email already exists' });
  }

  console.error('[error]', err);
  return res.status(500).json({ message: 'Internal server error' });
}

export { notFound, errorHandler };

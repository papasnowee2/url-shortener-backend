import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import AppError from '../utils/AppError.js';

function notFound(_req: Request, res: Response): void {
  res.status(404).json({ message: 'Route not found' });
}

function isDuplicateKeyError(err: unknown): err is { code: number } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: number }).code === 11000
  );
}

// Centralized error handler. Maps known error types to the contract responses.
function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Validation errors',
      errors: err.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      })),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  // Duplicate key (e.g. unique email) safety net.
  if (isDuplicateKeyError(err)) {
    res.status(409).json({ message: 'Email already exists' });
    return;
  }

  console.error('[error]', err);
  res.status(500).json({ message: 'Internal server error' });
}

export { notFound, errorHandler };

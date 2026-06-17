import type { NextFunction, Request, Response } from 'express';
import AppError from '../utils/AppError.js';
import { verifyAccessToken } from '../services/token.service.js';
import config from '../config/index.js';

// Reads the JWT from the httpOnly accessToken cookie and attaches the user id.
function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[config.cookie.name];

  if (!token) {
    next(new AppError(401, 'Authentication required'));
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.sub };
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
}

export default requireAuth;

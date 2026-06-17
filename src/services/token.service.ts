import jwt, { type SignOptions } from 'jsonwebtoken';
import type { CookieOptions } from 'express';
import config from '../config/index.js';

interface AccessTokenPayload {
  sub: string;
}

function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as SignOptions);
}

function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, config.jwt.secret);

  if (typeof decoded === 'string' || !decoded.sub) {
    throw new Error('Invalid token payload');
  }

  return { sub: decoded.sub };
}

// Standard cookie options used when setting/clearing the auth cookie.
function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.env === 'production',
    maxAge: config.cookie.maxAge,
    path: '/',
  };
}

export { signAccessToken, verifyAccessToken, cookieOptions };

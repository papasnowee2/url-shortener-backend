const AppError = require('../utils/AppError');
const { verifyAccessToken } = require('../services/token.service');
const config = require('../config');

// Reads the JWT from the httpOnly accessToken cookie and attaches the user id.
function requireAuth(req, _res, next) {
  const token = req.cookies?.[config.cookie.name];

  if (!token) {
    return next(new AppError(401, 'Authentication required'));
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.sub };
    return next();
  } catch (err) {
    return next(new AppError(401, 'Invalid or expired token'));
  }
}

module.exports = requireAuth;

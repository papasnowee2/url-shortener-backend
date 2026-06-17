const jwt = require('jsonwebtoken');
const config = require('../config');

function signAccessToken(payload) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

// Standard cookie options used when setting/clearing the auth cookie.
function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.env === 'production',
    maxAge: config.cookie.maxAge,
    path: '/',
  };
}

module.exports = { signAccessToken, verifyAccessToken, cookieOptions };

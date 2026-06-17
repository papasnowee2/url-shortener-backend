import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  credentialsSchema,
  loginSchema,
} from '../validators/user.validator.js';
import {
  signAccessToken,
  cookieOptions,
} from '../services/token.service.js';
import config from '../config/index.js';

// POST /users  -> create user, set httpOnly accessToken cookie, return { id }
const register = asyncHandler(async (req, res) => {
  const { email, password } = credentialsSchema.parse(req.body);

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError(409, 'Email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash });

  const token = signAccessToken({ sub: user._id.toString() });
  res.cookie(config.cookie.name, token, cookieOptions());

  res.status(201).json({ id: user._id.toString() });
});

// POST /users/login -> verify credentials, set cookie, return empty body (201)
const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(401, 'Invalid credentials');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'Invalid credentials');
  }

  const token = signAccessToken({ sub: user._id.toString() });
  res.cookie(config.cookie.name, token, cookieOptions());

  res.status(201).send();
});

// POST /users/logout -> clear cookie, return empty body (200)
const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(config.cookie.name, { ...cookieOptions(), maxAge: undefined });
  res.status(200).send();
});

export { register, login, logout };

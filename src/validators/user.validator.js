const { z } = require('zod');

// Strict schema for registration (drives the 400 "Validation errors" response).
const credentialsSchema = z.object({
  email: z.string({ required_error: 'email is required' }).email('Invalid email'),
  password: z
    .string({ required_error: 'password is required' })
    .min(6, 'Password must be at least 6 characters'),
});

// Lenient schema for login: only requires the fields to be present non-empty
// strings, so wrong-but-well-formed credentials resolve to 401, not 400.
const loginSchema = z.object({
  email: z.string({ required_error: 'email is required' }).min(1, 'email is required'),
  password: z
    .string({ required_error: 'password is required' })
    .min(1, 'password is required'),
});

module.exports = { credentialsSchema, loginSchema };

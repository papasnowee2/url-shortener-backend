const { z } = require('zod');

const urlBodySchema = z.object({
  url: z
    .string({ required_error: 'url is required' })
    .trim()
    .url('Invalid URL'),
});

module.exports = { urlBodySchema };

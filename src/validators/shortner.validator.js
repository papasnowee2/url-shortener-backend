import { z } from 'zod';

const urlBodySchema = z.object({
  url: z
    .string({ required_error: 'url is required' })
    .trim()
    .url('Invalid URL'),
});

export { urlBodySchema };

import 'dotenv/config';

export type ShortenerProviderName = 'cleanuri' | 'isgd' | 'tinyurl' | 'spoome';

export interface Config {
  env: string;
  port: number;
  clientOrigin: string;
  mongoUri: string;
  jwt: {
    secret: string;
    expiresIn: string;
  };
  cookie: {
    name: string;
    maxAge: number;
  };
  shortener: {
    provider: string;
    tinyurlToken: string;
  };
}

const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/url-shortener',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cookie: {
    name: 'accessToken',
    maxAge: Number(process.env.COOKIE_MAX_AGE) || 7 * 24 * 60 * 60 * 1000,
  },
  shortener: {
    provider: (process.env.SHORTENER_PROVIDER || 'cleanuri').toLowerCase(),
    tinyurlToken: process.env.TINYURL_API_TOKEN || '',
  },
};

export default config;

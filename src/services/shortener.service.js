import axios from 'axios';
import config from '../config/index.js';
import AppError from '../utils/AppError.js';

// --- Providers -------------------------------------------------------------
// Each provider takes a long URL and returns a short URL string by calling an
// external, third-party shortening service.

async function cleanuriProvider(longUrl) {
  const { data } = await axios.post(
    'https://cleanuri.com/api/v1/shorten',
    new URLSearchParams({ url: longUrl }).toString(),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10000,
    }
  );

  if (data && data.result_url) {
    return data.result_url;
  }

  const message = data?.error || 'Failed to create short link';
  throw new AppError(502, `Shortener provider error: ${message}`);
}

async function isgdProvider(longUrl) {
  const { data } = await axios.get('https://is.gd/create.php', {
    params: { format: 'json', url: longUrl },
    timeout: 10000,
  });

  if (data && data.shorturl) {
    return data.shorturl;
  }

  // is.gd returns { errorcode, errormessage } as JSON on failure, but can also
  // return a plain-text error string when its backend is unhealthy.
  const message =
    data?.errormessage ||
    (typeof data === 'string' ? data : 'Failed to create short link');
  throw new AppError(502, `Shortener provider error: ${message}`);
}

async function tinyurlProvider(longUrl) {
  if (!config.shortener.tinyurlToken) {
    throw new AppError(
      500,
      'TINYURL_API_TOKEN is not configured for the tinyurl provider'
    );
  }

  const { data } = await axios.post(
    'https://api.tinyurl.com/create',
    { url: longUrl },
    {
      headers: { Authorization: `Bearer ${config.shortener.tinyurlToken}` },
      timeout: 10000,
    }
  );

  const tiny = data?.data?.tiny_url;
  if (tiny) {
    return tiny;
  }

  throw new AppError(502, 'Shortener provider error: TinyURL request failed');
}

async function spoomeProvider(longUrl) {
  const { data } = await axios.post(
    'https://spoo.me/api/v1/shorten',
    { long_url: longUrl },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    }
  );

  if (data?.short_url) {
    return data.short_url;
  }

  const message = data?.error || 'Failed to create short link';
  throw new AppError(502, `Shortener provider error: ${message}`);
}

const providers = {
  cleanuri: cleanuriProvider,
  isgd: isgdProvider,
  tinyurl: tinyurlProvider,
  spoome: spoomeProvider,
};

async function createShortUrl(longUrl) {
  const provider = providers[config.shortener.provider];
  if (!provider) {
    throw new AppError(
      500,
      `Unknown shortener provider: ${config.shortener.provider}`
    );
  }

  try {
    return await provider(longUrl);
  } catch (err) {
    if (err instanceof AppError) throw err;
    // Network / unexpected upstream failures.
    throw new AppError(502, 'Failed to reach the shortener provider');
  }
}

export { createShortUrl };

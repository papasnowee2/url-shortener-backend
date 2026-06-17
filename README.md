# URL Shortener Backend

Node.js + Express service for creating short URLs, with JWT authentication
(stored in an httpOnly cookie), MongoDB persistence, and short links generated
by an external third-party provider.

## Stack

- Express 4
- MongoDB + Mongoose
- JWT auth via httpOnly `accessToken` cookie
- `bcryptjs` for password hashing
- `zod` for request validation
- External shortener provider (default: **cleanuri.com**, no API key required)

## Prerequisites

- Node.js 18+ (uses `node --watch` for the dev script)
- MongoDB running locally on its default port (`27017`)

## Setup

```bash
npm install
cp .env.example .env   # on Windows: copy .env.example .env
npm run dev            # or: npm start
```

The server listens on `http://localhost:3000` by default and connects to
MongoDB at `mongodb://127.0.0.1:27017/url-shortener`.

## Environment variables

See [.env.example](.env.example). Key ones:

| Variable             | Default                                       | Description                                  |
| -------------------- | --------------------------------------------- | -------------------------------------------- |
| `PORT`               | `3000`                                         | HTTP server port                             |
| `CLIENT_ORIGIN`      | `http://localhost:5173`                        | Frontend origin allowed to send cookies      |
| `MONGODB_URI`        | `mongodb://127.0.0.1:27017/url-shortener`      | MongoDB connection string                    |
| `JWT_SECRET`         | (set me)                                       | Secret used to sign access tokens            |
| `JWT_EXPIRES_IN`     | `7d`                                           | Token lifetime                               |
| `SHORTENER_PROVIDER` | `cleanuri`                                     | `cleanuri`, `isgd`, `spoome`, or `tinyurl`   |
| `TINYURL_API_TOKEN`  | empty                                          | Required only when provider is `tinyurl`     |

## External shortener provider

Short links are created by calling a third-party service, abstracted in
[src/services/shortener.service.js](src/services/shortener.service.js). All
providers require outbound internet access:

- **cleanuri** (default) — free, no API key.
- **isgd** — free, no API key (note: is.gd's backend can be intermittently
  unavailable, returning "database insert failed").
- **spoome** — free, no API key (uses the [Spoo.me v1 API](https://docs.spoo.me/introduction)).
- **tinyurl** — set `SHORTENER_PROVIDER=tinyurl` and `TINYURL_API_TOKEN=...`
  (uses the authenticated `api.tinyurl.com` endpoint).

To add another provider, implement a function `(longUrl) => shortUrl` and
register it in the `providers` map.

## API

Base URL: `http://localhost:3000`. Authenticated routes require the
`accessToken` cookie, which is set automatically on register/login.

### Users

| Method | Path            | Auth | Body                   | Success            |
| ------ | --------------- | ---- | ---------------------- | ------------------ |
| POST   | `/users`        | no   | `{ email, password }`  | `201 { id }` + cookie |
| POST   | `/users/login`  | no   | `{ email, password }`  | `201` (empty) + cookie |
| POST   | `/users/logout` | no   | none                   | `200` (empty), clears cookie |

Errors: `400` validation, `409` email already exists, `401` invalid credentials.

### Short links (`/shortner`)

| Method | Path            | Auth | Body          | Success                              |
| ------ | --------------- | ---- | ------------- | ------------------------------------ |
| POST   | `/shortner`     | yes  | `{ url }`     | `201 { id, shortLink, originalLink }`|
| GET    | `/shortner`     | yes  | none          | `200 [ { id, shortLink, originalLink } ]` |
| PATCH  | `/shortner/:id` | yes  | `{ url }`     | `200 { id, shortLink, originalLink }`|
| DELETE | `/shortner/:id` | yes  | none          | `200 { id }`                         |

Errors per contract:

- `400 Bad Request` — invalid short link ID; on **PATCH**, also "not the owner".
- `403 Forbidden` — on **DELETE**, "not the owner".
- `404 Not Found` — short link not found.

> Note: the contract intentionally returns `400` for a non-owner on `PATCH` but
> `403` on `DELETE`; this implementation matches that contract exactly.

`PATCH` updates the destination by requesting a brand new short link from the
external provider (free providers can't re-point an existing short link), so the
`shortLink` value changes after an update.

## Health check

`GET /health` -> `200 { "status": "ok" }`.

## Quick test (curl)

```bash
# Register (saves the cookie to cookies.txt)
curl -i -c cookies.txt -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"a@b.com","password":"secret123"}'

# Create a short link (sends the cookie)
curl -i -b cookies.txt -X POST http://localhost:3000/shortner \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/some/long/path"}'

# List
curl -b cookies.txt http://localhost:3000/shortner
```

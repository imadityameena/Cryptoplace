# Cryptoplace API

REST API for Cryptoplace, built with Node.js, Express and MongoDB.

It serves live market data (proxied from CoinGecko with caching so the API key stays on the server), user accounts, watchlists, portfolio tracking and price alerts.

## Getting started

Requirements: Node.js 18+ and MongoDB.

```bash
cd server
npm install
cp .env.example .env   # then fill in the values
npm run dev
```

The API runs at `http://localhost:5000/api`.

To start a local MongoDB with Docker:

```bash
docker run -d --name cryptoplace-mongo -p 27017:27017 mongo:7
```

### Running with Docker Compose

Starts the API together with a MongoDB container:

```bash
cp .env.example .env   # set JWT_SECRET and COINGECKO_API_KEY
docker compose up --build
```

### Environment variables

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | Port the server listens on | `5000` |
| `MONGO_URI` | MongoDB connection string | required |
| `JWT_SECRET` | Secret used to sign auth tokens | required |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `CLIENT_URL` | Allowed CORS origin(s), comma separated | `http://localhost:5173` |
| `GOOGLE_CLIENT_ID` | OAuth client ID for Google sign-in (empty disables it) | empty |
| `COINGECKO_API_KEY` | CoinGecko demo API key | empty |
| `COINGECKO_BASE_URL` | CoinGecko API base URL | `https://api.coingecko.com/api/v3` |
| `CACHE_TTL_SECONDS` | How long market responses are cached | `60` |
| `ALERT_CHECK_INTERVAL_SECONDS` | How often price alerts are evaluated | `120` |

### Scripts

- `npm run dev` starts the server and restarts on file changes
- `npm start` starts the server
- `npm test` runs the test suite against an in-memory MongoDB

## Project structure

```
src/
  config/       environment, database connection, mongoose settings
  controllers/  request handlers
  middleware/   auth, validation, rate limiting, error handling
  models/       User, WatchlistItem, Transaction, Alert
  routes/       route definitions
  services/     CoinGecko client, portfolio maths, alert checker
  utils/        helpers (errors, cache, tokens, constants)
  validators/   request validation rules
  app.js        express app
  server.js     entry point
tests/          API and unit tests
```

## API reference

All responses are JSON. Successful responses contain `"success": true`, errors contain `"success": false` and a `message` (plus `details` for validation errors).

Protected routes need an `Authorization: Bearer <token>` header.

Supported currencies: `usd`, `eur`, `inr`, `gbp`, `jpy`, `aud`, `cad`, `btc`, `eth`.

### Health

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/health` | Service status |

### Market data (public)

| Method | Path | Query | Description |
| --- | --- | --- | --- |
| GET | `/api/market/currencies` | | Supported currencies |
| GET | `/api/market/coins` | `vs_currency`, `page`, `per_page` | Coins ranked by market cap |
| GET | `/api/market/coins/:id` | | Coin details |
| GET | `/api/market/coins/:id/chart` | `vs_currency`, `days` (1-365) | Historical prices |
| GET | `/api/market/search` | `q` | Search coins by name or symbol |
| GET | `/api/market/trending` | | Trending coins |

### Auth

| Method | Path | Auth | Body |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | | `name`, `email`, `password` |
| POST | `/api/auth/login` | | `email`, `password` |
| GET | `/api/auth/google/config` | | Returns the Google client ID, or `null` when disabled |
| POST | `/api/auth/google` | | `credential` (Google ID token) |
| GET | `/api/auth/me` | yes | |
| PATCH | `/api/auth/me` | yes | `name?`, `preferredCurrency?` |
| PATCH | `/api/auth/password` | yes | `currentPassword`, `newPassword` |
| DELETE | `/api/auth/me` | yes | Deletes the account and all its data |

Passwords must be 8-128 characters and contain at least one letter and one number. Changing the password signs out all other sessions.

**Google sign-in:** the frontend gets an ID token from Google Identity Services and sends it to `/api/auth/google`. The server verifies it with Google, then logs in the linked account, links Google to an existing account with the same (verified) email, or creates a new account. Accounts created with Google have `hasPassword: false`; they can set a password with `PATCH /api/auth/password` without sending `currentPassword`.

To enable it, create an OAuth client ID (type "Web application") in Google Cloud Console, add your frontend URL (e.g. `http://localhost:5173`) under **Authorized JavaScript origins**, and set `GOOGLE_CLIENT_ID`.

Register and login return:

```json
{ "success": true, "token": "<jwt>", "user": { "id": "...", "name": "...", "email": "...", "preferredCurrency": "usd" } }
```

### Watchlist (auth required)

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/watchlist?vs_currency=` | Saved coins with live market data |
| POST | `/api/watchlist` | Add a coin, body: `{ "coinId": "bitcoin" }` |
| DELETE | `/api/watchlist/:coinId` | Remove a coin |
| DELETE | `/api/watchlist` | Clear the watchlist |

### Portfolio (auth required)

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/portfolio?vs_currency=` | Holdings, value, cost basis and profit/loss |
| GET | `/api/portfolio/transactions` | List transactions (`coinId`, `page`, `limit`) |
| POST | `/api/portfolio/transactions` | Record a transaction |
| GET | `/api/portfolio/transactions/:id` | Get one transaction |
| PATCH | `/api/portfolio/transactions/:id` | Update a transaction |
| DELETE | `/api/portfolio/transactions/:id` | Delete a transaction |

Transaction body:

```json
{
  "coinId": "bitcoin",
  "type": "buy",
  "quantity": 0.5,
  "pricePerCoin": 60000,
  "fee": 5,
  "currency": "usd",
  "date": "2026-01-15",
  "note": "optional"
}
```

`currency` defaults to the user's preferred currency and `date` defaults to now. Sells that would exceed the quantity held at that date are rejected.

Profit and loss use the average cost method. When transactions were recorded in a different currency from the one requested, amounts are converted at current exchange rates.

### Price alerts (auth required)

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/alerts` | List alerts (`status`, `coinId`) |
| POST | `/api/alerts` | Create an alert |
| GET | `/api/alerts/:id` | Get one alert |
| PATCH | `/api/alerts/:id` | Update an alert or set `status` to `active` / `paused` |
| DELETE | `/api/alerts/:id` | Delete an alert |

Alert body:

```json
{ "coinId": "bitcoin", "condition": "above", "targetPrice": 100000, "currency": "usd" }
```

A background job checks active alerts every `ALERT_CHECK_INTERVAL_SECONDS`. When the condition is met the alert's status becomes `triggered`, with `triggeredAt` and `triggeredPrice` recorded. Changing the condition, target or currency of a triggered alert re-activates it. Each user can have up to 50 active alerts.

## Rate limits

- 300 requests per 15 minutes per IP across the API
- 20 failed login/register attempts per 15 minutes per IP

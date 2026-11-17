# Cryptoplace

A cryptocurrency marketplace app for browsing live prices, viewing coin charts, and tracking a personal watchlist, portfolio and price alerts.

## Features

- Live prices for the top coins in USD, EUR or INR, with search
- Coin details with a 10 day price chart
- Accounts with email/password or Google sign-in, plus account settings
- Watchlist: star coins to follow them
- Portfolio: record buys and sells to see holdings, average cost, and realized and unrealized profit
- Price alerts: get notified in the app when a coin goes above or below a target price

## Tech stack

- **Frontend:** React, Vite, React Router, Google Charts
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT authentication
- **Market data:** CoinGecko API, accessed through the backend

## Project structure

```
Cryptoplace/
  src/
    api/          API client
    components/   Navbar, Footer, LineChart, WatchButton, ProtectedRoute
    context/      Auth, coin, watchlist and alerts state
    pages/        Home, Coin, Login/Signup, Watchlist, Portfolio, Alerts, Account
    utils/        formatting helpers
  server/         Express REST API (see server/README.md)
```

## Running locally

Start the backend first:

```bash
cd server
npm install
cp .env.example .env   # set MONGO_URI, JWT_SECRET, COINGECKO_API_KEY and optionally GOOGLE_CLIENT_ID
npm run dev
```

Then the frontend, from the project root:

```bash
npm install
npm run dev
```

The app opens at `http://localhost:5173`. In development, Vite forwards `/api` requests to the backend at `http://localhost:5000`.

### Frontend configuration

| Variable | Where | Description |
| --- | --- | --- |
| `VITE_API_URL` | `.env` | Backend URL for production builds, e.g. `https://api.example.com/api`. Defaults to `/api`. |
| `API_PROXY_TARGET` | shell | Backend the dev server proxies to. Defaults to `http://localhost:5000`. |

Google sign-in is configured only on the server (`GOOGLE_CLIENT_ID`). The button appears automatically once it is set. See [server/README.md](server/README.md) for how to create the client ID, other backend configuration and the full API reference.

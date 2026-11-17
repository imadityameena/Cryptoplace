# Cryptoplace

A cryptocurrency marketplace app for browsing live prices, viewing coin charts, and tracking a personal watchlist, portfolio and price alerts.

## Tech stack

- **Frontend:** React, Vite, React Router, Google Charts
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT authentication
- **Market data:** CoinGecko API

## Project structure

```
Cryptoplace/
  src/        React frontend
  public/     static assets
  server/     Express REST API (see server/README.md)
```

## Running locally

### Frontend

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

### Backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Runs at `http://localhost:5000/api`. See [server/README.md](server/README.md) for configuration and the full API reference.

export const CURRENCIES = {
  usd: { name: "usd", symbol: "$" },
  eur: { name: "eur", symbol: "€" },
  inr: { name: "inr", symbol: "₹" },
  gbp: { name: "gbp", symbol: "£" },
  jpy: { name: "jpy", symbol: "¥" },
  aud: { name: "aud", symbol: "A$" },
  cad: { name: "cad", symbol: "C$" },
};

export const currencyFor = (code) =>
  CURRENCIES[code] || { name: code, symbol: code.toUpperCase() };

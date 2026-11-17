export const CURRENCIES = {
  usd: { name: "usd", symbol: "$" },
  eur: { name: "eur", symbol: "€" },
  inr: { name: "inr", symbol: "₹" },
};

export const currencyFor = (code) =>
  CURRENCIES[code] || { name: code, symbol: code.toUpperCase() };

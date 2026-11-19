const isMissing = (value) => value === null || value === undefined || Number.isNaN(value);

export const formatMoney = (value, currency, options = {}) => {
  if (isMissing(value)) return "-";
  const abs = Math.abs(value);
  const maximumFractionDigits = options.maximumFractionDigits ?? (abs >= 1 ? 2 : 6);
  const formatted = abs.toLocaleString(undefined, { maximumFractionDigits });
  return `${value < 0 ? "-" : ""}${currency.symbol} ${formatted}`;
};

export const formatPercent = (value) => {
  if (isMissing(value)) return "-";
  return `${value.toFixed(2)}%`;
};

// Percentage with an explicit sign, for price changes and profit/loss
export const formatChange = (value) => {
  if (isMissing(value)) return "-";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
};

export const changeClass = (value) => (value > 0 ? "green" : value < 0 ? "red" : "");

export const formatQuantity = (value) =>
  Number(value).toLocaleString(undefined, { maximumFractionDigits: 8 });

export const formatNumber = (value) =>
  isMissing(value) ? "-" : value.toLocaleString(undefined, { maximumFractionDigits: 0 });

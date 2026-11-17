export const formatMoney = (value, currency, options = {}) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  const abs = Math.abs(value);
  const maximumFractionDigits = options.maximumFractionDigits ?? (abs >= 1 ? 2 : 6);
  const formatted = abs.toLocaleString(undefined, { maximumFractionDigits });
  return `${value < 0 ? "-" : ""}${currency.symbol} ${formatted}`;
};

export const formatPercent = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return `${Math.floor(value * 100) / 100}%`;
};

export const formatQuantity = (value) =>
  Number(value).toLocaleString(undefined, { maximumFractionDigits: 8 });

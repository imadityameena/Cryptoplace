import ApiError from "../utils/ApiError.js";

const EPSILON = 1e-12;

const byDate = (a, b) =>
  new Date(a.date) - new Date(b.date) || new Date(a.createdAt) - new Date(b.createdAt);

/**
 * Throws if, in chronological order, any sell exceeds the quantity held.
 */
export const assertNoOversell = (transactions) => {
  const held = new Map();

  for (const tx of [...transactions].sort(byDate)) {
    const current = held.get(tx.coinId) || 0;
    const next = tx.type === "buy" ? current + tx.quantity : current - tx.quantity;

    if (next < -EPSILON) {
      throw ApiError.badRequest(
        `Cannot sell more ${tx.coinId} than held on ${new Date(tx.date).toISOString().slice(0, 10)}`
      );
    }
    held.set(tx.coinId, next);
  }
};

/**
 * Builds per-coin holdings using the average cost method.
 * `convert(amount, fromCurrency)` converts values into the target currency.
 */
export const buildHoldings = (transactions, convert) => {
  const holdings = new Map();

  for (const tx of [...transactions].sort(byDate)) {
    const h = holdings.get(tx.coinId) || {
      coinId: tx.coinId,
      quantity: 0,
      costBasis: 0,
      realizedPnl: 0,
      totalFees: 0,
      transactionCount: 0,
    };

    const price = convert(tx.pricePerCoin, tx.currency);
    const fee = convert(tx.fee || 0, tx.currency);
    h.totalFees += fee;
    h.transactionCount += 1;

    if (tx.type === "buy") {
      h.quantity += tx.quantity;
      h.costBasis += tx.quantity * price + fee;
    } else {
      const avgCost = h.quantity > 0 ? h.costBasis / h.quantity : 0;
      const sold = Math.min(tx.quantity, h.quantity);
      h.realizedPnl += sold * (price - avgCost) - fee;
      h.costBasis -= sold * avgCost;
      h.quantity -= sold;
    }

    if (h.quantity < EPSILON) {
      h.quantity = 0;
      h.costBasis = 0;
    }

    holdings.set(tx.coinId, h);
  }

  return [...holdings.values()];
};

export const summarize = (holdings, marketById) => {
  let totalValue = 0;
  let totalCost = 0;
  let totalRealized = 0;
  let totalUnrealized = 0;

  const items = holdings.map((h) => {
    const market = marketById.get(h.coinId);
    const currentPrice = market?.current_price ?? null;
    const value = currentPrice !== null ? h.quantity * currentPrice : null;
    const unrealizedPnl = value !== null ? value - h.costBasis : null;

    totalCost += h.costBasis;
    totalRealized += h.realizedPnl;
    if (value !== null) {
      totalValue += value;
      totalUnrealized += unrealizedPnl;
    }

    return {
      coinId: h.coinId,
      name: market?.name ?? h.coinId,
      symbol: market?.symbol ?? null,
      image: market?.image ?? null,
      quantity: h.quantity,
      averageCost: h.quantity > 0 ? h.costBasis / h.quantity : 0,
      costBasis: h.costBasis,
      currentPrice,
      priceChange24h: market?.price_change_percentage_24h ?? null,
      value,
      unrealizedPnl,
      unrealizedPnlPercent:
        unrealizedPnl !== null && h.costBasis > 0 ? (unrealizedPnl / h.costBasis) * 100 : null,
      realizedPnl: h.realizedPnl,
      totalFees: h.totalFees,
      transactionCount: h.transactionCount,
    };
  });

  items.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  for (const item of items) {
    item.allocationPercent =
      totalValue > 0 && item.value !== null ? (item.value / totalValue) * 100 : 0;
  }

  return {
    totals: {
      value: totalValue,
      costBasis: totalCost,
      unrealizedPnl: totalUnrealized,
      unrealizedPnlPercent: totalCost > 0 ? (totalUnrealized / totalCost) * 100 : 0,
      realizedPnl: totalRealized,
    },
    holdings: items,
  };
};

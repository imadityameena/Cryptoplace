import { useCallback, useContext, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../api/client";
import { CoinContext } from "../../context/CoinContext";
import { currencyFor } from "../../constants";
import { changeClass, formatChange, formatMoney, formatPercent, formatQuantity } from "../../utils/format";
import { ToastContext } from "../../context/ToastContext";
import usePageTitle from "../../hooks/usePageTitle";
import TransactionForm from "./TransactionForm";
import "../Auth/Auth.css";
import "../Watchlist/Watchlist.css";
import "./Portfolio.css";

const PAGE_SIZE = 10;

const Portfolio = () => {
  const { currency, allCoin } = useContext(CoinContext);
  const { notify } = useContext(ToastContext);
  usePageTitle("Portfolio");
  const [searchParams, setSearchParams] = useSearchParams();
  const prefillCoin = searchParams.get("add");

  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(Boolean(prefillCoin));
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    setError("");

    Promise.all([
      api.get(`/portfolio?vs_currency=${currency.name}`, { signal }),
      api.get(`/portfolio/transactions?page=${page}&limit=${PAGE_SIZE}`, { signal }),
    ])
      .then(([summaryRes, txRes]) => {
        setSummary(summaryRes.data);
        setTransactions(txRes.data);
        setPagination(txRes.pagination);
      })
      .catch((err) => err.name !== "AbortError" && setError(err.message));

    return () => controller.abort();
  }, [currency, page, refreshKey]);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const closeForm = () => {
    setShowForm(false);
    if (prefillCoin) setSearchParams({}, { replace: true });
  };

  const savedHandler = () => {
    closeForm();
    setPage(1);
    refresh();
    notify("Transaction saved", "success");
  };

  const deleteHandler = async (tx) => {
    if (!window.confirm(`Delete this ${tx.type} of ${formatQuantity(tx.quantity)} ${coinName(tx.coinId)}?`)) {
      return;
    }
    try {
      await api.delete(`/portfolio/transactions/${tx.id}`);
      if (transactions.length === 1 && page > 1) setPage(page - 1);
      refresh();
    } catch (err) {
      notify(err.message);
    }
  };

  if (!summary && !error) {
    return (
      <div className="spinner">
        <div className="spin"></div>
      </div>
    );
  }

  const totals = summary?.totals;
  const coinName = (id) => allCoin.find((c) => c.id === id)?.name ?? id;
  const openHoldings = summary?.holdings.filter((h) => h.quantity > 0) ?? [];

  return (
    <div className="page portfolio">
      <div className="page-header page-header-row">
        <div>
          <h1>Portfolio</h1>
          <p>Track your holdings and profit across all your coins.</p>
        </div>
        {!showForm && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + Add transaction
          </button>
        )}
      </div>

      {error && <p className="form-error content-width">{error}</p>}

      {showForm && (
        <div className="content-width">
          <TransactionForm initialCoinId={prefillCoin} onSaved={savedHandler} onCancel={closeForm} />
        </div>
      )}

      {totals && (
        <div className="stat-grid content-width">
          <div className="stat-card">
            <span>Total value</span>
            <strong>{formatMoney(totals.value, currency)}</strong>
          </div>
          <div className="stat-card">
            <span>Cost basis</span>
            <strong>{formatMoney(totals.costBasis, currency)}</strong>
          </div>
          <div className="stat-card">
            <span>Unrealized P/L</span>
            <strong className={changeClass(totals.unrealizedPnl)}>
              {formatMoney(totals.unrealizedPnl, currency)}
            </strong>
            <small className={changeClass(totals.unrealizedPnl)}>
              {formatChange(totals.unrealizedPnlPercent)}
            </small>
          </div>
          <div className="stat-card">
            <span>Realized P/L</span>
            <strong className={changeClass(totals.realizedPnl)}>
              {formatMoney(totals.realizedPnl, currency)}
            </strong>
          </div>
        </div>
      )}

      <h2 className="section-title content-width">Holdings</h2>
      <div className="crypto-table holdings-table">
        <div className="holdings-row header">
          <p>Coin</p>
          <p>Quantity</p>
          <p className="hide-sm">Avg cost</p>
          <p>Value</p>
          <p>P/L</p>
          <p className="hide-sm">Allocation</p>
        </div>
        {openHoldings.length === 0 && (
          <p className="table-message">
            No holdings yet. Add your first transaction to start tracking.
          </p>
        )}
        {openHoldings.map((h) => (
          <Link to={`/coin/${h.coinId}`} className="holdings-row" key={h.coinId}>
            <div className="coin-cell">
              {h.image && <img src={h.image} alt="" />}
              <div>
                <p>{h.name}</p>
                <small>{formatMoney(h.currentPrice, currency)}</small>
              </div>
            </div>
            <p>
              {formatQuantity(h.quantity)} <small>{h.symbol?.toUpperCase()}</small>
            </p>
            <p className="hide-sm">{formatMoney(h.averageCost, currency)}</p>
            <p>{formatMoney(h.value, currency)}</p>
            <div className={`pnl-cell ${changeClass(h.unrealizedPnl)}`}>
              <p>{formatMoney(h.unrealizedPnl, currency)}</p>
              <small>{formatChange(h.unrealizedPnlPercent)}</small>
            </div>
            <div className="hide-sm alloc-cell">
              <div className="alloc-bar">
                <span style={{ width: `${Math.min(h.allocationPercent, 100)}%` }}></span>
              </div>
              <small>{formatPercent(h.allocationPercent)}</small>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="section-title content-width">Transactions</h2>
      <div className="crypto-table tx-table">
        <div className="tx-row header">
          <p>Date</p>
          <p>Type</p>
          <p>Coin</p>
          <p>Quantity</p>
          <p className="hide-sm">Price</p>
          <p>Total</p>
          <p></p>
        </div>
        {transactions.length === 0 && <p className="table-message">No transactions yet.</p>}
        {transactions.map((tx) => {
          const txCurrency = currencyFor(tx.currency);
          return (
            <div className="tx-row" key={tx.id} title={tx.note || undefined}>
              <p>{new Date(tx.date).toLocaleDateString()}</p>
              <p>
                <span className={`badge ${tx.type}`}>{tx.type}</span>
              </p>
              <p className="tx-coin">{coinName(tx.coinId)}</p>
              <p>{formatQuantity(tx.quantity)}</p>
              <p className="hide-sm">{formatMoney(tx.pricePerCoin, txCurrency)}</p>
              <p>{formatMoney(tx.quantity * tx.pricePerCoin, txCurrency)}</p>
              <button
                className="icon-button"
                onClick={() => deleteHandler(tx)}
                aria-label="Delete transaction"
                title="Delete transaction"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
      {pagination.pages > 1 && (
        <div className="pager content-width">
          <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            className="btn-secondary"
            disabled={page >= pagination.pages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Portfolio;

import { useCallback, useContext, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../api/client";
import { CoinContext } from "../../context/CoinContext";
import { AlertsContext } from "../../context/AlertsContext";
import { currencyFor } from "../../constants";
import { formatMoney } from "../../utils/format";
import AlertForm from "./AlertForm";
import "../Auth/Auth.css";
import "../Watchlist/Watchlist.css";
import "../Portfolio/Portfolio.css";
import "./Alerts.css";

const FILTERS = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "triggered", label: "Triggered" },
  { value: "paused", label: "Paused" },
];

const Alerts = () => {
  const { allCoin } = useContext(CoinContext);
  const { refreshTriggered } = useContext(AlertsContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const prefillCoin = searchParams.get("add");

  const [alerts, setAlerts] = useState(null);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(Boolean(prefillCoin));
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setError("");
    api
      .get(`/alerts${filter ? `?status=${filter}` : ""}`, { signal: controller.signal })
      .then((res) => setAlerts(res.data))
      .catch((err) => err.name !== "AbortError" && setError(err.message));
    return () => controller.abort();
  }, [filter, refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    refreshTriggered();
  }, [refreshTriggered]);

  const closeForm = () => {
    setShowForm(false);
    if (prefillCoin) setSearchParams({}, { replace: true });
  };

  const run = async (action) => {
    try {
      await action();
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const setStatus = (alertItem, status) =>
    run(() => api.patch(`/alerts/${alertItem.id}`, { status }));

  const deleteHandler = (alertItem) => {
    if (window.confirm("Delete this alert?")) {
      run(() => api.delete(`/alerts/${alertItem.id}`));
    }
  };

  const coinById = new Map(allCoin.map((c) => [c.id, c]));

  return (
    <div className="page alerts">
      <div className="page-header page-header-row">
        <div>
          <h1>Price alerts</h1>
          <p>Get notified here when a coin crosses your target price.</p>
        </div>
        {!showForm && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + New alert
          </button>
        )}
      </div>

      {showForm && (
        <div className="content-width">
          <AlertForm
            initialCoinId={prefillCoin}
            onSaved={() => {
              closeForm();
              refresh();
            }}
            onCancel={closeForm}
          />
        </div>
      )}

      <div className="filter-tabs content-width" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            role="tab"
            aria-selected={filter === f.value}
            className={filter === f.value ? "active" : ""}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="form-error content-width">{error}</p>}

      <div className="alert-list content-width">
        {alerts === null && !error && <p className="table-message">Loading alerts...</p>}
        {alerts?.length === 0 && (
          <p className="table-message">
            {filter ? `No ${filter} alerts.` : "You have no alerts yet."}
          </p>
        )}
        {alerts?.map((a) => {
          const coin = coinById.get(a.coinId);
          const cur = currencyFor(a.currency);
          return (
            <div className={`alert-card ${a.status}`} key={a.id}>
              <Link to={`/coin/${a.coinId}`} className="alert-coin">
                {coin && <img src={coin.image} alt="" />}
                <div>
                  <p>{coin?.name ?? a.coinId}</p>
                  <small>{coin?.symbol?.toUpperCase()}</small>
                </div>
              </Link>
              <div className="alert-rule">
                <p>
                  Price {a.condition} <strong>{formatMoney(a.targetPrice, cur)}</strong>
                </p>
                {a.status === "triggered" ? (
                  <small>
                    Hit {formatMoney(a.triggeredPrice, cur)} on{" "}
                    {new Date(a.triggeredAt).toLocaleString()}
                  </small>
                ) : (
                  a.note && <small>{a.note}</small>
                )}
              </div>
              <span className={`status-pill ${a.status}`}>{a.status}</span>
              <div className="alert-actions">
                {a.status === "active" && (
                  <button className="btn-secondary btn-sm" onClick={() => setStatus(a, "paused")}>
                    Pause
                  </button>
                )}
                {a.status === "paused" && (
                  <button className="btn-secondary btn-sm" onClick={() => setStatus(a, "active")}>
                    Resume
                  </button>
                )}
                {a.status === "triggered" && (
                  <button className="btn-secondary btn-sm" onClick={() => setStatus(a, "active")}>
                    Re-arm
                  </button>
                )}
                <button
                  className="icon-button"
                  onClick={() => deleteHandler(a)}
                  aria-label="Delete alert"
                  title="Delete alert"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Alerts;

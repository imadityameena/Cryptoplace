import { useContext, useEffect, useState } from "react";
import "./Coin.css";
import { Link, useParams } from "react-router-dom";
import { CoinContext } from "../../context/CoinContext";
import LineChart from "../../components/LineChart/LineChart";
import api from "../../api/client";
import WatchButton from "../../components/WatchButton/WatchButton";
import usePageTitle from "../../hooks/usePageTitle";
import { changeClass, formatChange, formatMoney, formatNumber } from "../../utils/format";

const RANGES = [
  { days: 1, label: "24H" },
  { days: 7, label: "7D" },
  { days: 30, label: "30D" },
  { days: 90, label: "90D" },
  { days: 365, label: "1Y" },
];

const Coin = () => {
  const { coinId } = useParams();
  const { currency } = useContext(CoinContext);
  const [coinData, setCoinData] = useState();
  const [error, setError] = useState("");
  const [days, setDays] = useState(7);
  const [chart, setChart] = useState({ data: null, loading: true, error: "" });

  usePageTitle(coinData ? `${coinData.name} (${coinData.symbol.toUpperCase()}) price` : "Coin");

  useEffect(() => {
    const controller = new AbortController();
    setError("");
    setCoinData(undefined);
    api
      .get(`/market/coins/${coinId}`, { signal: controller.signal })
      .then((res) => setCoinData(res.data))
      .catch((err) => err.name !== "AbortError" && setError(err.message));
    return () => controller.abort();
  }, [coinId]);

  useEffect(() => {
    const controller = new AbortController();
    setChart((prev) => ({ ...prev, loading: true, error: "" }));
    api
      .get(`/market/coins/${coinId}/chart?vs_currency=${currency.name}&days=${days}`, {
        signal: controller.signal,
      })
      .then((res) => setChart({ data: res.data, loading: false, error: "" }))
      .catch((err) => {
        if (err.name !== "AbortError") setChart({ data: null, loading: false, error: err.message });
      });
    return () => controller.abort();
  }, [coinId, currency, days]);

  if (error) {
    return (
      <div className="coin-error">
        <p>{error}</p>
        <Link to="/">Back to home</Link>
      </div>
    );
  }

  if (!coinData) {
    return (
      <div className="spinner">
        <div className="spin"></div>
      </div>
    );
  }

  const market = coinData.market_data ?? {};
  const inCurrency = (field) => market[field]?.[currency.name];
  const change24h = inCurrency("price_change_percentage_24h_in_currency");
  const athChange = inCurrency("ath_change_percentage");

  const stats = [
    { label: "Market cap rank", value: coinData.market_cap_rank ? `#${coinData.market_cap_rank}` : "-" },
    { label: "Market cap", value: formatMoney(inCurrency("market_cap"), currency, { maximumFractionDigits: 0 }) },
    { label: "24H volume", value: formatMoney(inCurrency("total_volume"), currency, { maximumFractionDigits: 0 }) },
    { label: "24H high", value: formatMoney(inCurrency("high_24h"), currency) },
    { label: "24H low", value: formatMoney(inCurrency("low_24h"), currency) },
    {
      label: "Circulating supply",
      value: `${formatNumber(market.circulating_supply)} ${coinData.symbol.toUpperCase()}`,
    },
    {
      label: "All-time high",
      value: formatMoney(inCurrency("ath"), currency),
      extra: athChange !== undefined && (
        <small className={changeClass(athChange)}>{formatChange(athChange)}</small>
      ),
    },
  ];

  return (
    <div className="coin">
      <Link to="/" className="back-link">
        ← All coins
      </Link>

      <div className="coin-name">
        <img src={coinData.image.large} alt="" />
        <h1>
          {coinData.name} <span>{coinData.symbol.toUpperCase()}</span>
        </h1>
        <p className="coin-price">
          {formatMoney(inCurrency("current_price"), currency)}
          <span className={changeClass(change24h)}>{formatChange(change24h)} (24H)</span>
        </p>
        <div className="coin-actions">
          <WatchButton coinId={coinData.id} withLabel />
          <Link to={`/portfolio?add=${coinData.id}`} className="coin-action-link">
            + Add to portfolio
          </Link>
          <Link to={`/alerts?add=${coinData.id}`} className="coin-action-link">
            Set price alert
          </Link>
        </div>
      </div>

      <div className="chart-ranges" role="tablist" aria-label="Chart range">
        {RANGES.map((r) => (
          <button
            key={r.days}
            role="tab"
            aria-selected={days === r.days}
            className={days === r.days ? "active" : ""}
            onClick={() => setDays(r.days)}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div className={`coin-chart ${chart.loading ? "loading" : ""}`}>
        {chart.error ? (
          <p className="chart-empty">{chart.error}</p>
        ) : chart.data ? (
          <LineChart historicalData={chart.data} days={days} currency={currency} />
        ) : (
          <div className="spinner small">
            <div className="spin"></div>
          </div>
        )}
      </div>

      <div className="coin-info">
        {stats.map((s) => (
          <ul key={s.label}>
            <li>{s.label}</li>
            <li>
              {s.value} {s.extra}
            </li>
          </ul>
        ))}
      </div>
    </div>
  );
};

export default Coin;

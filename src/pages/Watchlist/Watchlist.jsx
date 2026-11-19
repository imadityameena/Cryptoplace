import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import { CoinContext } from "../../context/CoinContext";
import { WatchlistContext } from "../../context/WatchlistContext";
import CoinRow, { CoinTableHeader } from "../../components/CoinRow/CoinRow";
import usePageTitle from "../../hooks/usePageTitle";
import "../Home/Home.css";
import "./Watchlist.css";

const Watchlist = () => {
  const { currency } = useContext(CoinContext);
  const { coinIds, ready, version } = useContext(WatchlistContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  usePageTitle("Watchlist");

  useEffect(() => {
    const controller = new AbortController();
    setError("");
    api
      .get(`/watchlist?vs_currency=${currency.name}`, { signal: controller.signal })
      .then((res) => setItems(res.data))
      .catch((err) => err.name !== "AbortError" && setError(err.message))
      .finally(() => !controller.signal.aborted && setLoading(false));
    return () => controller.abort();
  }, [currency, version]);

  // Hide coins the user unstars while on this page
  const visible = ready ? items.filter((item) => coinIds.has(item.coinId)) : items;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Watchlist</h1>
        <p>Coins you are keeping an eye on.</p>
      </div>
      <div className="crypto-table">
        <CoinTableHeader />
        {loading && <p className="table-message">Loading watchlist...</p>}
        {!loading && error && <p className="table-message">{error}</p>}
        {!loading && !error && visible.length === 0 && (
          <div className="table-message">
            <p>Your watchlist is empty.</p>
            <p>
              Tap the star next to any coin on the <Link to="/" className="link">home page</Link> to add it.
            </p>
          </div>
        )}
        {!loading &&
          visible.map(({ coinId, market }) => (
            <CoinRow key={coinId} coinId={coinId} market={market} currency={currency} />
          ))}
      </div>
    </div>
  );
};

export default Watchlist;

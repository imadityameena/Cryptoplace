import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import { CoinContext } from "../../context/CoinContext";
import { WatchlistContext } from "../../context/WatchlistContext";
import WatchButton from "../../components/WatchButton/WatchButton";
import { formatMoney, formatPercent } from "../../utils/format";
import "../Home/Home.css";
import "./Watchlist.css";

const Watchlist = () => {
  const { currency } = useContext(CoinContext);
  const { coinIds, ready, version } = useContext(WatchlistContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        <div className="table-layout">
          <p>#</p>
          <p>Coins</p>
          <p>Price</p>
          <p style={{ textAlign: "center" }}>24H Change</p>
          <p className="market-cap">Market Cap</p>
        </div>
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
            <Link to={`/coin/${coinId}`} className="table-layout" key={coinId}>
              <div className="rank-cell">
                <WatchButton coinId={coinId} size={18} />
                <p>{market?.market_cap_rank ?? "-"}</p>
              </div>
              <div>
                {market && <img src={market.image} alt="" />}
                <p>{market ? `${market.name} - ${market.symbol}` : coinId}</p>
              </div>
              <p>{market ? formatMoney(market.current_price, currency) : "-"}</p>
              <p className={market?.price_change_percentage_24h > 0 ? "green" : "red"}>
                {market ? formatPercent(market.price_change_percentage_24h) : "-"}
              </p>
              <p className="market-cap">{market ? formatMoney(market.market_cap, currency) : "-"}</p>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default Watchlist;

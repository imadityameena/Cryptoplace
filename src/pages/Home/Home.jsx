import { useContext, useMemo, useState } from "react";
import "./Home.css";
import { CoinContext } from "../../context/CoinContext";
import { AuthContext } from "../../context/AuthContext";
import CoinRow, { CoinTableHeader } from "../../components/CoinRow/CoinRow";
import usePageTitle from "../../hooks/usePageTitle";

const PAGE_SIZE = 10;

const Home = () => {
  const { allCoin, loading, error, reload, lastUpdated, currency } = useContext(CoinContext);
  const { user } = useContext(AuthContext);
  const [input, setInput] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  usePageTitle("Live crypto prices");

  const query = input.trim().toLowerCase();
  const displayCoin = useMemo(
    () =>
      query
        ? allCoin.filter(
            (item) =>
              item.name.toLowerCase().includes(query) || item.symbol.toLowerCase().includes(query)
          )
        : allCoin,
    [allCoin, query]
  );

  const inputHandler = (event) => {
    setInput(event.target.value);
    setVisibleCount(PAGE_SIZE);
  };

  const clearSearch = () => {
    setInput("");
    setVisibleCount(PAGE_SIZE);
  };

  // Results filter as you type, so submitting only needs to keep the page from reloading
  const searchHandler = (event) => {
    event.preventDefault();
  };

  const shown = displayCoin.slice(0, visibleCount);

  return (
    <div className="home">
      <div className="hero">
        <h1>
          Largest <br />
          Crypto Marketplace
        </h1>
        <p>
          {user
            ? "Welcome back. Star coins to watch them, track your portfolio and set price alerts."
            : "Welcome to the world's largest cryptocurrency marketplace. Sign up to explore more about cryptos."}
        </p>
        <form onSubmit={searchHandler} role="search">
          <input
            onChange={inputHandler}
            list="coinlist"
            value={input}
            type="search"
            placeholder="Search by name or symbol..."
            aria-label="Search coins"
          />
          <datalist id="coinlist">
            {allCoin.map((item) => (
              <option key={item.id} value={item.name} />
            ))}
          </datalist>
          {input && (
            <button type="button" className="clear-search" onClick={clearSearch}>
              Clear
            </button>
          )}
        </form>
      </div>

      <div className="crypto-table">
        <CoinTableHeader />
        {loading && <p className="table-message">Loading coins...</p>}
        {!loading && error && (
          <div className="table-message">
            <p>{error}</p>
            <button className="retry-button" onClick={reload}>
              Try again
            </button>
          </div>
        )}
        {!loading && !error && displayCoin.length === 0 && (
          <p className="table-message">No coins match "{input.trim()}"</p>
        )}
        {!loading &&
          !error &&
          shown.map((item) => (
            <CoinRow key={item.id} coinId={item.id} market={item} currency={currency} />
          ))}
      </div>

      {!loading && !error && (
        <div className="table-footer">
          {displayCoin.length > visibleCount && (
            <button className="show-more" onClick={() => setVisibleCount((n) => n + PAGE_SIZE * 2)}>
              Show more
            </button>
          )}
          <p>
            Showing {shown.length} of {displayCoin.length} coins
            {lastUpdated && ` · Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;

import { Link } from "react-router-dom";
import WatchButton from "../WatchButton/WatchButton";
import { changeClass, formatChange, formatMoney } from "../../utils/format";

export const CoinTableHeader = () => (
  <div className="table-layout table-header">
    <p>#</p>
    <p>Coin</p>
    <p>Price</p>
    <p className="change-cell">24H Change</p>
    <p className="market-cap">Market Cap</p>
  </div>
);

// One row of the coin table. `market` may be missing when price data is unavailable.
const CoinRow = ({ coinId, market, currency }) => {
  const change = market?.price_change_percentage_24h;
  return (
    <Link to={`/coin/${coinId}`} className="table-layout table-row">
      <div className="rank-cell">
        <WatchButton coinId={coinId} size={18} />
        <p>{market?.market_cap_rank ?? "-"}</p>
      </div>
      <div className="name-cell">
        {market?.image && <img src={market.image} alt="" loading="lazy" />}
        <p>
          {market?.name ?? coinId}
          {market?.symbol && <small>{market.symbol.toUpperCase()}</small>}
        </p>
      </div>
      <p>{formatMoney(market?.current_price, currency)}</p>
      <p className={`change-cell ${changeClass(change)}`}>{formatChange(change)}</p>
      <p className="market-cap">
        {formatMoney(market?.market_cap, currency, { maximumFractionDigits: 0 })}
      </p>
    </Link>
  );
};

export default CoinRow;

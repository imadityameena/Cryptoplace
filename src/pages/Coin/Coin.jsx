import { useContext, useEffect, useState } from "react";
import "./Coin.css";
import { Link, useParams } from "react-router-dom";
import { CoinContext } from "../../context/CoinContext";
import LineChart from "../../components/LineChart/LineChart";
import api from "../../api/client";
import WatchButton from "../../components/WatchButton/WatchButton";

const Coin = () => {
  const { coinId } = useParams();
  const [coinData, setCoinData] = useState();
  const [historicalData, setHistoricalData] = useState();
  const { currency } = useContext(CoinContext);

  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const load = async () => {
      setError("");
      try {
        const [coinRes, chartRes] = await Promise.all([
          api.get(`/market/coins/${coinId}`, { signal }),
          api.get(`/market/coins/${coinId}/chart?vs_currency=${currency.name}&days=10`, { signal }),
        ]);
        setCoinData(coinRes.data);
        setHistoricalData(chartRes.data);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      }
    };

    load();
    return () => controller.abort();
  }, [coinId, currency]);

  if (error) {
    return (
      <div className="coin-error">
        <p>{error}</p>
        <Link to="/">Back to home</Link>
      </div>
    );
  }

  return coinData && historicalData ? (
    <div className="coin">
      <div className="coin-name">
        <img src={coinData.image.large} alt="" />
        <p>
          <b>
            {coinData.name} ({coinData.symbol.toUpperCase()})
          </b>
        </p>
        <WatchButton coinId={coinData.id} withLabel />
      </div>
      <div className="coin-chart">
        <LineChart historicalData={historicalData} />
      </div>
      <div className="coin-info">
        <ul>
          <li>Crypto Market Rank</li>
          <li>{coinData.market_cap_rank}</li>
        </ul>
        <ul>
          <li>Current Price</li>
          <li>{currency.symbol} {coinData.market_data.current_price[currency.name].toLocaleString()}</li>
        </ul>
        <ul>
          <li>Market Cap</li>
          <li>{currency.symbol} {coinData.market_data.market_cap[currency.name].toLocaleString()}</li>
        </ul>
        <ul>
          <li>24H High</li>
          <li>{currency.symbol} {coinData.market_data.high_24h[currency.name].toLocaleString()}</li>
        </ul>
        <ul>
          <li>24H Low</li>
          <li>{currency.symbol} {coinData.market_data.low_24h[currency.name].toLocaleString()}</li>
        </ul>
      </div>
    </div>
  ) : (
    <div className="spinner">
      <div className="spin"></div>
    </div>
  );
};

export default Coin;

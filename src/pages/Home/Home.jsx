import { useContext, useEffect, useState } from "react";
import "./Home.css";
import { CoinContext } from "../../context/CoinContext";
import { Link } from "react-router-dom";
import WatchButton from "../../components/WatchButton/WatchButton";

const Home = () => {
  const { allCoin, loading, error, currency } = useContext(CoinContext);
  const [displayCoin, setDisplayCoin] = useState([]);
  const [input, setInput] = useState('');

  const inputHandler = (event) => {
    setInput(event.target.value);
    if(event.target.value==""){
      setDisplayCoin(allCoin);
    }
  }

    const searchHandler = async (event) => {
    event.preventDefault();
    const coins= await allCoin.filter((item)=>{
      return item.name.toLowerCase().includes(input.toLowerCase())
    })
    setDisplayCoin(coins)
  }

  useEffect(() => {
    setDisplayCoin(allCoin);
  }, [allCoin]);

  return (
    <div className="home">
      <div className="hero">
        <h1>
          Largest <br />
          Crypto Marketplace
        </h1>
        <p>
          Welcome to the world's largest cryptocurrency marketplace. Sign up to
          explore more about cryptos.
        </p>
        <form onSubmit={searchHandler}>
          <input onChange={inputHandler} list="coinlist" value={input} type="text" placeholder="Search crypto..." required />
          <datalist id="coinlist">
            {allCoin.map((item,i)=>(
              <option key={i} value={item.name}/>
            ))}
          </datalist>
          <button type="submit">Search</button>
        </form>
      </div>
      <div className="crypto-table">
        <div className="table-layout">
          <p>#</p>
          <p>Coins</p>
          <p>Price</p>
          <p style={{ textAlign: "center" }}>24H Change</p>
          <p className="market-cap">Market Cap</p>
        </div>
        {loading && <p className="table-message">Loading coins...</p>}
        {!loading && error && <p className="table-message">{error}</p>}
        {!loading && !error && displayCoin.length === 0 && (
          <p className="table-message">No coins found</p>
        )}
        {!loading && displayCoin.slice(0,10).map((item) => (
          <Link to={`/coin/${item.id}`} className="table-layout" key={item.id}>
          <div className="rank-cell">
            <WatchButton coinId={item.id} size={18} />
            <p>{item.market_cap_rank}</p>
          </div>
          <div>
            <img src={item.image} alt="" />
            <p>{item.name + "- " + item.symbol}</p>
          </div>
          <p>{currency.symbol} {item.current_price.toLocaleString()}</p>
          <p className={item.price_change_percentage_24h >0 ? "green" : "red"}
          >{Math.floor(item.price_change_percentage_24h*100)/100}</p>
          <p className="market-cap">{currency.symbol} {item.market_cap.toLocaleString()}</p>
        </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;

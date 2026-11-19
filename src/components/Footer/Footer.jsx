import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <nav className="footer-links" aria-label="Footer">
        <Link to="/">Markets</Link>
        <Link to="/watchlist">Watchlist</Link>
        <Link to="/portfolio">Portfolio</Link>
        <Link to="/alerts">Alerts</Link>
      </nav>
      <p>
        Market data by{" "}
        <a href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer">
          CoinGecko
        </a>
      </p>
      <p>Copyright © {new Date().getFullYear()}, Cryptoplace - All Rights Reserved.</p>
    </footer>
  );
};

export default Footer;

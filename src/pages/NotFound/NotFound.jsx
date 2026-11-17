import { Link } from "react-router-dom";
import "../Coin/Coin.css";

const NotFound = () => (
  <div className="coin-error">
    <h1>404</h1>
    <p>The page you are looking for does not exist.</p>
    <Link to="/">Back to home</Link>
  </div>
);

export default NotFound;

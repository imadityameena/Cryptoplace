import { Link } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";
import "../Coin/Coin.css";

const NotFound = () => {
  usePageTitle("Page not found");
  return (
    <div className="coin-error">
      <h1>404</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/">Back to home</Link>
    </div>
  );
};

export default NotFound;

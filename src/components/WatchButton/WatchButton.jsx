import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { WatchlistContext } from "../../context/WatchlistContext";
import "./WatchButton.css";

const WatchButton = ({ coinId, size = 20, withLabel = false }) => {
  const { user } = useContext(AuthContext);
  const { isWatched, add, remove } = useContext(WatchlistContext);
  const navigate = useNavigate();
  const location = useLocation();
  const watched = isWatched(coinId);

  const clickHandler = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    (watched ? remove(coinId) : add(coinId)).catch((err) => alert(err.message));
  };

  const label = watched ? "Remove from watchlist" : "Add to watchlist";

  return (
    <button
      type="button"
      className={`watch-button ${watched ? "watched" : ""} ${withLabel ? "with-label" : ""}`}
      onClick={clickHandler}
      aria-label={label}
      aria-pressed={watched}
      title={label}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.54L12 17.5l-5.87 3.08 1.12-6.54L2.5 9.41l6.56-.95L12 2.5z"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
      {withLabel && <span>{watched ? "Watching" : "Add to watchlist"}</span>}
    </button>
  );
};

export default WatchButton;

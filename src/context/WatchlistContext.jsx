import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { AuthContext } from "./AuthContext";

export const WatchlistContext = createContext();

const WatchlistContextProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [coinIds, setCoinIds] = useState(() => new Set());
  const [ready, setReady] = useState(false);
  // Bumped after the server confirms a change, so pages can refetch
  const [version, setVersion] = useState(0);
  const userId = user?.id;

  useEffect(() => {
    setReady(false);
    if (!userId) {
      setCoinIds(new Set());
      return;
    }

    let cancelled = false;
    api
      .get("/watchlist")
      .then((res) => {
        if (!cancelled) setCoinIds(new Set(res.data.map((item) => item.coinId)));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const update = (coinId, present) =>
    setCoinIds((prev) => {
      const next = new Set(prev);
      if (present) next.add(coinId);
      else next.delete(coinId);
      return next;
    });

  const add = useCallback(async (coinId) => {
    update(coinId, true);
    try {
      await api.post("/watchlist", { coinId });
      setVersion((v) => v + 1);
    } catch (err) {
      if (err.status !== 409) {
        update(coinId, false);
        throw err;
      }
    }
  }, []);

  const remove = useCallback(async (coinId) => {
    update(coinId, false);
    try {
      await api.delete(`/watchlist/${coinId}`);
      setVersion((v) => v + 1);
    } catch (err) {
      if (err.status !== 404) {
        update(coinId, true);
        throw err;
      }
    }
  }, []);

  const value = useMemo(
    () => ({
      coinIds,
      ready,
      version,
      isWatched: (coinId) => coinIds.has(coinId),
      add,
      remove,
    }),
    [coinIds, ready, version, add, remove]
  );

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
};

export default WatchlistContextProvider;

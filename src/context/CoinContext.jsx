import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { CURRENCIES } from "../constants";
import { AuthContext } from "./AuthContext";

export const CoinContext = createContext();

const REFRESH_INTERVAL_MS = 60 * 1000;

const CoinContextProvider = (props) => {
  const [allCoin, setAllCoin] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [currency, setCurrency] = useState(CURRENCIES.usd);
  const { user } = useContext(AuthContext);
  const preferredCurrency = user?.preferredCurrency;

  useEffect(() => {
    if (preferredCurrency && CURRENCIES[preferredCurrency]) {
      setCurrency(CURRENCIES[preferredCurrency]);
    }
  }, [preferredCurrency]);

  useEffect(() => {
    const controller = new AbortController();

    // Background refreshes keep the current list on screen instead of showing a loader
    const fetchAllCoin = async (background) => {
      if (!background) {
        setLoading(true);
        setError("");
      }
      try {
        const res = await api.get(`/market/coins?vs_currency=${currency.name}`, {
          signal: controller.signal,
        });
        setAllCoin(res.data);
        setLastUpdated(new Date());
        setError("");
      } catch (err) {
        if (err.name !== "AbortError" && !background) setError(err.message);
      } finally {
        if (!controller.signal.aborted && !background) setLoading(false);
      }
    };

    fetchAllCoin(false);
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") fetchAllCoin(true);
    }, REFRESH_INTERVAL_MS);

    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [currency, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const contextValue = useMemo(
    () => ({ allCoin, loading, error, lastUpdated, reload, currency, setCurrency }),
    [allCoin, loading, error, lastUpdated, reload, currency]
  );

  return (
    <CoinContext.Provider value={contextValue}>
      {props.children}
    </CoinContext.Provider>
  );
};

export default CoinContextProvider;

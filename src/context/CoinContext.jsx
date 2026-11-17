import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";
import { CURRENCIES } from "../constants";
import { AuthContext } from "./AuthContext";

export const CoinContext = createContext();

const CoinContextProvider = (props) => {
  const [allCoin, setAllCoin] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

    const fetchAllCoin = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/market/coins?vs_currency=${currency.name}`, {
          signal: controller.signal,
        });
        setAllCoin(res.data);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchAllCoin();
    return () => controller.abort();
  }, [currency]);

  const contextValue = { allCoin, loading, error, currency, setCurrency };

  return (
    <CoinContext.Provider value={contextValue}>
      {props.children}
    </CoinContext.Provider>
  );
};

export default CoinContextProvider;

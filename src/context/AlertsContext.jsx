import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { AuthContext } from "./AuthContext";

export const AlertsContext = createContext();

const POLL_INTERVAL_MS = 60 * 1000;

const AlertsContextProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [triggeredCount, setTriggeredCount] = useState(0);
  const userId = user?.id;

  const refreshTriggered = useCallback(() => {
    if (!userId) return;
    api
      .get("/alerts?status=triggered")
      .then((res) => setTriggeredCount(res.data.length))
      .catch(() => {});
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setTriggeredCount(0);
      return;
    }
    refreshTriggered();
    const timer = setInterval(refreshTriggered, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [userId, refreshTriggered]);

  const value = useMemo(
    () => ({ triggeredCount, refreshTriggered }),
    [triggeredCount, refreshTriggered]
  );

  return <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>;
};

export default AlertsContextProvider;

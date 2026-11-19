import { createContext, useCallback, useMemo, useRef, useState } from "react";
import "./Toast.css";

export const ToastContext = createContext({ notify: () => {} });

const DURATION_MS = 4000;

const ToastContextProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message, type = "error") => {
      const id = ++nextId.current;
      setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
      setTimeout(() => dismiss(id), DURATION_MS);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div className={`toast ${t.type}`} key={t.id}>
            <span>{t.message}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss">
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastContextProvider;

import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { getGoogleClientId, loadGoogleScript } from "./googleIdentity";
import "./GoogleButton.css";

const GoogleButton = ({ text = "continue_with", onSuccess, onError }) => {
  const { loginWithGoogle } = useContext(AuthContext);
  const containerRef = useRef(null);
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);

  // Keep the latest callbacks without re-initializing Google
  const handlers = useRef({ onSuccess, onError });
  handlers.current = { onSuccess, onError };

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      const clientId = await getGoogleClientId();
      if (!clientId || cancelled) return;

      let google;
      try {
        google = await loadGoogleScript();
      } catch (err) {
        if (!cancelled) handlers.current.onError?.(err.message);
        return;
      }
      if (cancelled || !containerRef.current) return;

      google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          setBusy(true);
          try {
            const user = await loginWithGoogle(credential);
            handlers.current.onSuccess?.(user);
          } catch (err) {
            handlers.current.onError?.(err.message);
            setBusy(false);
          }
        },
      });

      google.accounts.id.renderButton(containerRef.current, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        shape: "pill",
        text,
        width: Math.min(containerRef.current.offsetWidth || 350, 400),
      });
      setAvailable(true);
    };

    setup();
    return () => {
      cancelled = true;
    };
  }, [loginWithGoogle, text]);

  return (
    <div className={`google-auth ${available ? "" : "hidden"}`}>
      <div className={`google-button ${busy ? "busy" : ""}`} ref={containerRef}></div>
      {busy && <p className="google-status">Signing in with Google...</p>}
      <div className="auth-divider">
        <span>or</span>
      </div>
    </div>
  );
};

export default GoogleButton;

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import CoinContextProvider from "./context/CoinContext.jsx";
import AuthContextProvider from "./context/AuthContext.jsx";
import WatchlistContextProvider from "./context/WatchlistContext.jsx";
import AlertsContextProvider from "./context/AlertsContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthContextProvider>
        <CoinContextProvider>
          <WatchlistContextProvider>
            <AlertsContextProvider>
              <App />
            </AlertsContextProvider>
          </WatchlistContextProvider>
        </CoinContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  </StrictMode>
);

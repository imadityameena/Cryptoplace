import api from "../../api/client";

const SCRIPT_URL = "https://accounts.google.com/gsi/client";

let configPromise;
let scriptPromise;

export const getGoogleClientId = () => {
  if (!configPromise) {
    configPromise = api
      .get("/auth/google/config")
      .then((res) => res.clientId)
      .catch(() => {
        configPromise = undefined;
        return null;
      });
  }
  return configPromise;
};

export const loadGoogleScript = () => {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve(window.google);
      script.onerror = () => {
        scriptPromise = undefined;
        script.remove();
        reject(new Error("Could not load Google sign-in"));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
};

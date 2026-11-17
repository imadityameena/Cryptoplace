import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import api, { getToken, setToken, onUnauthorized } from "../api/client";

export const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(() => Boolean(getToken()));

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    onUnauthorized(logout);
    if (!getToken()) return;

    api
      .get("/auth/me")
      .then((res) => setUser(res.user))
      .catch(() => logout())
      .finally(() => setInitializing(false));
  }, [logout]);

  const handleAuth = (res) => {
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const login = useCallback(
    (email, password) => api.post("/auth/login", { email, password }).then(handleAuth),
    []
  );

  const register = useCallback(
    (name, email, password) =>
      api.post("/auth/register", { name, email, password }).then(handleAuth),
    []
  );

  const loginWithGoogle = useCallback(
    (credential) => api.post("/auth/google", { credential }).then(handleAuth),
    []
  );

  const updateProfile = useCallback(async (changes) => {
    const res = await api.patch("/auth/me", changes);
    setUser(res.user);
    return res.user;
  }, []);

  const changePassword = useCallback(
    (currentPassword, newPassword) =>
      api.patch("/auth/password", { currentPassword, newPassword }).then(handleAuth),
    []
  );

  const value = useMemo(
    () => ({
      user,
      initializing,
      login,
      register,
      loginWithGoogle,
      logout,
      updateProfile,
      changePassword,
    }),
    [user, initializing, login, register, loginWithGoogle, logout, updateProfile, changePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContextProvider;

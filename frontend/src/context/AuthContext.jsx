import { useMemo, useState } from "react";
import { isLoggedIn, login as loginRequest, logout as logoutRequest } from "../api/authService";
import { AuthContext } from "./AuthContextObject.js";

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(isLoggedIn());
  const [authError, setAuthError] = useState("");

  async function login(username, password) {
    setAuthError("");
    try {
      await loginRequest(username, password);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      setAuthError(error.message);
      setIsAuthenticated(false);
      return false;
    }
  }

  function logout() {
    logoutRequest();
    setIsAuthenticated(false);
    setAuthError("");
  }

  const value = useMemo(
    () => ({
      isAuthenticated,
      authError,
      login,
      logout,
    }),
    [isAuthenticated, authError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

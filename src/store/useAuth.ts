import { useEffect, useState } from "react";
import { auth } from "./auth";

export function useAuth() {
  const [token, setToken] = useState(auth.getState().token);

  useEffect(() => {
    return auth.subscribe((s) => setToken(s.token));
  }, []);

  return {
    token,
    isLoggedIn: !!token,
    login: auth.login,
    logout: auth.logout,
    loadFromStorage: auth.loadFromStorage,
  };
}

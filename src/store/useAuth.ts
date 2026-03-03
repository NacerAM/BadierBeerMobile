import { useEffect, useState } from "react";
import { auth } from "./auth";

export function useAuth() {
  const [state, setState] = useState(auth.getState());

  useEffect(() => {
    return auth.subscribe((s) => setState(s));
  }, []);

  return {
    token: state.token,
    user: state.user,
    isLoggedIn: !!state.token,
    login: auth.login,
    logout: auth.logout,
    loadFromStorage: auth.loadFromStorage,
  };
}

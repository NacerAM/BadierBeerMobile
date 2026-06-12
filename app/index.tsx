import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { auth } from "../src/store/auth";

export default function Index() {
  const [ready, setReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    (async () => {
      await auth.loadFromStorage();
      setIsLoggedIn(!!auth.getState().token);
      setReady(true);
    })();

    const unsub = auth.subscribe((s) => setIsLoggedIn(!!s.token));
    return unsub;
  }, []);

  if (!ready) return null;

  return (
    <Redirect href={(isLoggedIn ? "/(user)/" : "/(visitor)/") as any} />
  );
}

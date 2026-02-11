import { Redirect } from "expo-router";

const isLoggedIn = false; // TODO: remplacer par auth réelle

export default function Index() {
return (
  <Redirect
    href={(isLoggedIn ? "/(user)/" : "/(visitor)/") as any}
  />
);
}

import { Redirect } from "expo-router";

export default function UserIndex() {
  // Force l’entrée dans le layout Tabs
  return <Redirect href="/(user)/(tabs)" />;
}
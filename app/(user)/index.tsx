import { Redirect } from "expo-router";
import { useAuth } from "../../src/store/useAuth";

export default function UserIndex() {
  const { user } = useAuth();

  if (user?.role === "ADMIN") {
    return <Redirect href="/(user)/(tabs)/admin" />;
  }

  return <Redirect href="/(user)/(tabs)" />;
}

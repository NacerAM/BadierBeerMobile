import { Stack } from "expo-router";

export default function UserStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="glass/[id]" />
    </Stack>
  );
}
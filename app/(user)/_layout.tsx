import React from "react";
import { Stack, usePathname } from "expo-router";
import { View, Pressable, Image, Text, StyleSheet } from "react-native";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { useAuth } from "../../src/store/useAuth";
import { router } from "expo-router";

export default function UserStackLayout() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isProfile = pathname?.includes("/(user)/(tabs)/profile") || pathname?.endsWith("/profile");
  return (
    <View style={{ flex: 1 }} pointerEvents="box-none">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="glass/[id]" />
        <Stack.Screen name="profile/[id]" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="my-events" />
        <Stack.Screen name="event/[id]" />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen name="proposal/[id]" />
        <Stack.Screen name="proposal-edit/[id]" />
        <Stack.Screen name="admin-stats" />
        <Stack.Screen name="admin-stats/[section]" />
        <Stack.Screen name="admin-glass/[id]" />
        <Stack.Screen name="admin-glass-edit/[id]" />
        <Stack.Screen name="admin-product/[id]" />
        <Stack.Screen name="admin-product-edit/[id]" />
        <Stack.Screen name="admin-event-create" />
        <Stack.Screen name="admin-event-edit/[id]" />
        <Stack.Screen name="brewer-event-create" />
        <Stack.Screen name="brewer-product-create" />
        <Stack.Screen name="brewer-product/[id]" />
      </Stack>
      {!isProfile && (
        <Pressable
          onPress={() => router.push("/(user)/(tabs)/profile" as any)}
          style={styles.profileBtn}
          hitSlop={10}
        >
          {user?.avatarUrl ? (
            <Image source={{ uri: (user as any).avatarUrl }} style={{ width: 36, height: 36, borderRadius: 10 }} />
          ) : (
            <Text style={{ fontSize: 18 }}>🙂</Text>
          )}
        </Pressable>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  profileBtn: {
    position: "absolute",
    right: spacing.lg,
    top: spacing.xl,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadow as any,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
});

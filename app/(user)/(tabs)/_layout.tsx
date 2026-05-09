import { Tabs, usePathname } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../../../src/theme/colors";
import { useCallback, useEffect, useState } from "react";
import { listNotificationsApi } from "../../../src/api/notificationsApi";

export default function UserTabsLayout() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = useCallback(async () => {
    try {
      const res = await listNotificationsApi();
      setUnreadCount(res.unreadCount ?? 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount, pathname]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontWeight: "700" },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border, borderTopWidth: 1 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} color={color} size={size ?? 22} />
          ),
        }}
      />
      <Tabs.Screen
        name="catalogue"
        options={{
          title: "Catalogue",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "albums" : "albums-outline"} color={color} size={size ?? 22} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messagerie",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} color={color} size={size ?? 22} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explorer",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "compass" : "compass-outline"} color={color} size={size ?? 22} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "notifications" : "notifications-outline"} color={color} size={size ?? 22} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.dangerText, color: "#fff", fontWeight: "900" },
        }}
      />

      <Tabs.Screen name="collection" options={{ href: null }} />
      <Tabs.Screen name="propose" options={{ href: null }} />
      <Tabs.Screen name="proposals" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="edit-profile" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="admin" options={{ href: null }} />
      <Tabs.Screen name="brewer" options={{ href: null }} />
      <Tabs.Screen name="brewer-products" options={{ href: null }} />
      <Tabs.Screen name="brewer-events" options={{ href: null }} />
    </Tabs>
  );
}

import { Tabs, usePathname } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../../../src/theme/colors";
import { useCallback, useEffect, useState } from "react";
import { listNotificationsApi } from "../../../src/api/notificationsApi";
import { listMessageUnreadCountApi } from "../../../src/api/messagesApi";
import { useAuth } from "../../../src/store/useAuth";

export default function UserTabsLayout() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const loadBadges = useCallback(async () => {
    try {
      const [notificationsRes, messagesRes] = await Promise.all([
        listNotificationsApi(),
        listMessageUnreadCountApi(),
      ]);
      setUnreadNotifications(notificationsRes.unreadCount ?? 0);
      setUnreadMessages(messagesRes.unreadCount ?? 0);
    } catch {
      setUnreadNotifications(0);
      setUnreadMessages(0);
    }
  }, []);

  useEffect(() => {
    loadBadges();
  }, [loadBadges, pathname]);

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
          tabBarBadge: unreadMessages > 0 ? unreadMessages : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.dangerText, color: "#fff", fontWeight: "900" },
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: isAdmin ? null : undefined,
          title: "Explorer",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "compass" : "compass-outline"} color={color} size={size ?? 22} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: isAdmin ? null : undefined,
          title: "Notifications",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "notifications" : "notifications-outline"} color={color} size={size ?? 22} />
          ),
          tabBarBadge: unreadNotifications > 0 ? unreadNotifications : undefined,
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

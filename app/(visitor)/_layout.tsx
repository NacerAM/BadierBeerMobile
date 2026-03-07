import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../../src/theme/colors";

export default function VisitorTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontWeight: '700' },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border, borderTopWidth: 1 },
      }}
    >
      {/* Visible tabs */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={size ?? 22} />
          ),
        }}
      />
      <Tabs.Screen
        name="catalogue"
        options={{
          title: 'Catalogue',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'albums' : 'albums-outline'} color={color} size={size ?? 22} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorer',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'compass' : 'compass-outline'} color={color} size={size ?? 22} />
          ),
        }}
      />

      {/* Hidden screens that still use the same tab bar */}
      <Tabs.Screen name="login" options={{ href: null }} />
      <Tabs.Screen name="register" options={{ href: null }} />
      <Tabs.Screen name="forgot-password" options={{ href: null }} />
      <Tabs.Screen name="glass/[id]" options={{ href: null }} />
    </Tabs>
  );
}

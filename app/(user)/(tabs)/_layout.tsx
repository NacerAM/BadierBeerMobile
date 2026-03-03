import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function UserTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#A8650F',
        tabBarInactiveTintColor: '#7A5A3D',
        tabBarLabelStyle: { fontWeight: '700' },
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
        name="messages"
        options={{
          title: 'Messagerie',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} color={color} size={size ?? 22} />
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

      {/* Hidden tabs (accessibles par navigation mais pas affichées) */}
      <Tabs.Screen name="collection" options={{ href: null }} />
      <Tabs.Screen name="propose" options={{ href: null }} />
      <Tabs.Screen name="proposals" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="edit-profile" options={{ href: null }} />
    </Tabs>
  );
}

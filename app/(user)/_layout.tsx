import { Tabs } from "expo-router";

export default function UserTabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Accueil" }} />
      <Tabs.Screen name="catalogue" options={{ title: "Catalogue" }} />
      <Tabs.Screen name="collection" options={{ title: "Collection" }} />
      <Tabs.Screen name="messages" options={{ title: "Messages" }} />
      <Tabs.Screen name="profile" options={{ title: "Profil" }} />
      <Tabs.Screen name="propose" options={{ title: "Proposer" }} />
      <Tabs.Screen name="proposals" options={{ title: "Mes demandes" }} />

    </Tabs>
  );
}

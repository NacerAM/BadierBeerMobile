import { View, Text, StyleSheet } from "react-native";
import Button from "../../src/components/Button";
import { useAuth } from "../../src/store/useAuth";
import { router } from "expo-router";

export default function Profile() {
  const { logout } = useAuth();

  async function onLogout() {
    await logout();
    router.replace("/(visitor)/" as any);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <Button label="Déconnexion" onPress={onLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  title: { fontSize: 22, fontWeight: "700" },
});

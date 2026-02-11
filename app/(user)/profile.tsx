import { View, Text, StyleSheet } from "react-native";

export default function Profile() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <Text>Infos utilisateur + déconnexion (à venir).</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
});

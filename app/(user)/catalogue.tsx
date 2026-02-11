import { View, Text, StyleSheet } from "react-native";

export default function CatalogueUser() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Catalogue (connecté)</Text>
      <Text>On réutilisera le catalogue public + actions collection.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
});

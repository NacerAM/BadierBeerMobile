import { View, Text, StyleSheet } from "react-native";

export default function GlassDetailPublicScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Détail d’un verre</Text>
      <Text>Infos du verre + images (à venir)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 8 },
});

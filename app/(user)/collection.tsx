import { View, Text, StyleSheet } from "react-native";

export default function MyCollection() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ma collection</Text>
      <Text>Liste des verres ajoutés (à venir).</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
});

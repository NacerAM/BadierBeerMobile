import { View, Text, StyleSheet } from "react-native";

export default function Messages() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messagerie</Text>
      <Text>Conversation avec l’administrateur (à venir).</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
});

import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HomeUserScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accueil Utilisateur</Text>
      <Text>Connecté ✅</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 8 },
});

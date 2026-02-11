import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HomeVisitorScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accueil Visiteur</Text>
      <Text>Badier Beer – Catalogue public</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 8 },
});

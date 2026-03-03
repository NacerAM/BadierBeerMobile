import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";

export default function ExploreVisitorScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explorer</Text>
      <Text style={styles.subtitle}>Bientôt: recherche avancée, catégories, etc.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing.lg, paddingHorizontal: spacing.lg, backgroundColor: colors.bg },
  title: { fontSize: typography.h1, fontWeight: '900', color: colors.text, marginBottom: spacing.sm },
  subtitle: { color: colors.muted },
});

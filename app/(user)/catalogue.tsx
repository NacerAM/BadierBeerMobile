import React from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { router } from "expo-router";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";

const MOCK_GLASSES = [
  { id: "1", name: "Chimay Trappistes", brand: "Chimay" },
  { id: "2", name: "Duvel Tulip", brand: "Duvel" },
  { id: "3", name: "Leffe Calice", brand: "Leffe" },
  { id: "4", name: "Orval Classic", brand: "Orval" },
];

export default function CatalogueUserScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Catalogue</Text>

      <FlatList
        data={MOCK_GLASSES}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/(user)/glass/[id]",
                params: { id: item.id },
              } as any)
            }
          >
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{item.brand}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing.lg, paddingHorizontal: spacing.md, backgroundColor: colors.bg },
  title: { fontSize: typography.h1, fontWeight: "800", color: colors.text, marginBottom: spacing.md },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing.md, backgroundColor: colors.card },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  cardSubtitle: { marginTop: 6, color: colors.muted },
});

import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, TextInput } from "react-native";
import { router } from "expo-router";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";

const MOCK_GLASSES = [
  { id: "1", name: "Chimay Trappistes", brand: "Chimay", status: "VALIDÉ" },
  { id: "2", name: "Duvel Tulip", brand: "Duvel", status: "VALIDÉ" },
  { id: "3", name: "Leffe Calice", brand: "Leffe", status: "VALIDÉ" },
  { id: "4", name: "Orval Classic", brand: "Orval", status: "VALIDÉ" },
];

export default function CataloguePublicScreen() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return MOCK_GLASSES;
    return MOCK_GLASSES.filter((g) => {
      return (
        g.name.toLowerCase().includes(query) ||
        g.brand.toLowerCase().includes(query)
      );
    });
  }, [q]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Catalogue public</Text>

      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Rechercher un verre ou un fabricant…"
        placeholderTextColor={colors.muted}
        style={styles.search}
        autoCapitalize="none"
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/glass/[id]",
                params: { id: item.id },
              })
            }
          >
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
            </View>

            <Text style={styles.cardSubtitle}>{item.brand}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucun résultat.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: typography.h1,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.md,
  },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    color: colors.text,
    marginBottom: spacing.md,
  },
  list: { gap: spacing.md, paddingBottom: spacing.xl },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: colors.card,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.text, flex: 1 },
  cardSubtitle: { marginTop: 6, color: colors.muted },
  badge: {
    backgroundColor: "#E9D8A6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { fontSize: 12, fontWeight: "800", color: colors.primaryDark },
  empty: { marginTop: spacing.lg, textAlign: "center", color: colors.muted },
});

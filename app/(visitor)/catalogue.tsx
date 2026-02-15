import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";
import { Glass, listGlassesApi } from "../../src/api/glassesApi";

export default function CataloguePublicScreen() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Glass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await listGlassesApi(1, 50);
      setItems(res.items);
    } catch (e: any) {
      setError(e?.message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((g) => {
      const brand = g.Manufacturer?.name || "";
      return g.name.toLowerCase().includes(query) || brand.toLowerCase().includes(query);
    });
  }, [q, items]);

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

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.centerText}>Chargement…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retry} onPress={load}>
            Réessayer
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/(visitor)/glass/[id]",
                  params: { id: String(item.id) },
                } as any)
              }
            >
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>VALIDÉ</Text>
                </View>
              </View>

              <Text style={styles.cardSubtitle}>{item.Manufacturer?.name || "—"}</Text>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Aucun résultat.</Text>}
        />
      )}
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
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  centerText: { color: colors.muted },
  errorText: { color: "#991B1B", fontWeight: "700", textAlign: "center" },
  retry: { color: colors.primaryDark, fontWeight: "800" },
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

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
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
      return (
        g.name.toLowerCase().includes(query) ||
        brand.toLowerCase().includes(query)
      );
    });
  }, [q, items]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Catalogue public</Text>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Rechercher un verre ou un fabricant…"
          placeholderTextColor={colors.muted}
          style={styles.search}
          autoCapitalize="none"
        />
      </View>

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
              style={({ pressed }) => [
                styles.card,
                pressed && { transform: [{ scale: 0.98 }] },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/(visitor)/glass/[id]",
                  params: { id: String(item.id) },
                } as any)
              }
            >
              {/* image placeholder */}
              <View style={styles.cardImage}>
                <Text style={styles.cardImageEmoji}>🍺</Text>

                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Validé</Text>
                </View>
              </View>

              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.cardSubtitle} numberOfLines={1}>
                {item.Manufacturer?.name || "—"}
              </Text>
            </Pressable>
          )}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.md }}
          ListEmptyComponent={
            <Text style={styles.empty}>Aucun résultat.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bg,
  },

  title: {
    fontSize: typography.h1,
    fontWeight: "900",
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: "center",
  },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    marginBottom: spacing.lg,

    shadowColor: colors.shadow as any,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  searchIcon: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: "900",
  },
  search: {
    flex: 1,
    color: colors.text,
    paddingVertical: 2,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  centerText: { color: colors.muted },
  errorText: { color: colors.dangerText, fontWeight: "800", textAlign: "center" },
  retry: { color: colors.primaryDark, fontWeight: "900" },

  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },

  card: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,

    shadowColor: colors.shadow as any,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },

  cardImage: {
    height: 140,
    borderRadius: 14,
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
    overflow: "hidden",
  },
  cardImageEmoji: { fontSize: 34, color: colors.muted },

  badge: {
    position: "absolute",
    left: spacing.sm,
    bottom: spacing.sm,
    backgroundColor: "#5B3A1E",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { color: "#FFF", fontWeight: "900", fontSize: 12 },

  cardTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.text,
    marginTop: 2,
  },
  cardSubtitle: { marginTop: 4, color: colors.muted, fontSize: 12 },

  empty: {
    marginTop: spacing.lg,
    textAlign: "center",
    color: colors.muted,
  },
});
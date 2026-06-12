import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, ActivityIndicator, Image } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";
import { Glass, listGlassesApi } from "../../src/api/glassesApi";

type SortMode = "recent" | "oldest" | "popular";

export default function CataloguePublicScreen() {
  const [q, setQ] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [items, setItems] = useState<Glass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
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
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const result = !query
      ? [...items]
      : items.filter((g) => (g.name.toLowerCase().includes(query) || (g.Manufacturer?.name || "").toLowerCase().includes(query)));

    result.sort((a, b) => {
      if (sortMode === "popular") {
        const ratingsDiff = Number(b.ratingsCount || 0) - Number(a.ratingsCount || 0);
        if (ratingsDiff !== 0) return ratingsDiff;
      }
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      if (sortMode === "oldest") return aTime - bTime;
      return bTime - aTime;
    });

    return result;
  }, [q, items, sortMode]);

  function primaryImageUrl(g: Glass): string | null {
    const list = g.images || [];
    const primary = list.find((i) => i.isPrimary) || list[0];
    return primary ? primary.url : null;
  }

  function StarsBar({ avg }: { avg: number | null | undefined }) {
    const n = Math.round(Number(avg || 0));
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text style={{ color: colors.text, fontWeight: '900' }}>{n}</Text>
        <Text style={{ fontSize: 14, color: colors.primaryDark }}>
          {Array.from({ length: 5 }).map((_, i) => (i < n ? '★' : '☆')).join('')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Catalogue public</Text>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={colors.muted as any} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Rechercher un verre ou un fabricant…"
          placeholderTextColor={colors.muted}
          style={styles.search}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Trier par</Text>
        <View style={styles.filterChips}>
          <Pressable onPress={() => setSortMode("recent")} style={[styles.chip, sortMode === "recent" && styles.chipActive]}>
            <Text style={[styles.chipText, sortMode === "recent" && styles.chipTextActive]}>Plus recents</Text>
          </Pressable>
          <Pressable onPress={() => setSortMode("oldest")} style={[styles.chip, sortMode === "oldest" && styles.chipActive]}>
            <Text style={[styles.chipText, sortMode === "oldest" && styles.chipTextActive]}>Plus anciens</Text>
          </Pressable>
          <Pressable onPress={() => setSortMode("popular")} style={[styles.chip, sortMode === "popular" && styles.chipActive]}>
            <Text style={[styles.chipText, sortMode === "popular" && styles.chipTextActive]}>Plus populaires</Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.centerText}>Chargement…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retry} onPress={load}>Réessayer</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.list, { paddingBottom: spacing.xxl + 70 }]}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.98 }] }]}
              onPress={() => router.push({ pathname: "/(visitor)/glass/[id]", params: { id: String(item.id) } } as any)}
            >
              <View style={styles.cardImage}>
                {primaryImageUrl(item) ? (
                  <Image source={{ uri: primaryImageUrl(item)! }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                  <Text style={styles.cardImageEmoji}>🍺</Text>
                )}
                <View style={styles.badge}><Text style={styles.badgeText}>Validé</Text></View>
              </View>

              <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.cardSubtitle} numberOfLines={1}>{item.Manufacturer?.name || '—'}</Text>

              <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <StarsBar avg={item.avgRating} />
                <Text style={{ color: colors.muted, fontSize: 12 }}>({item.ratingsCount || 0})</Text>
              </View>
            </Pressable>
          )}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.md }}
          ListEmptyComponent={<Text style={styles.empty}>Aucun résultat.</Text>}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing.lg, paddingHorizontal: spacing.lg, backgroundColor: colors.bg },
  title: { fontSize: typography.h1, fontWeight: '900', color: colors.text, marginBottom: spacing.md, textAlign: 'center' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 16, marginBottom: spacing.md, shadowColor: colors.shadow as any, shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  search: { flex: 1, color: colors.text, paddingVertical: 2 },
  filterRow: { marginBottom: spacing.lg },
  filterLabel: { color: colors.muted, fontWeight: '800', marginBottom: spacing.xs },
  filterChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  chipText: { color: colors.text, fontWeight: '800', fontSize: 12 },
  chipTextActive: { color: '#2E1A0F' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  centerText: { color: colors.muted },
  errorText: { color: colors.dangerText, fontWeight: '800', textAlign: 'center' },
  retry: { color: colors.primaryDark, fontWeight: '900' },
  list: { gap: spacing.md, paddingBottom: spacing.xl },
  card: { flex: 1, borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, padding: spacing.sm, shadowColor: colors.shadow as any, shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  cardImage: { height: 140, borderRadius: 14, backgroundColor: colors.bg2, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm, overflow: 'hidden' },
  cardImageEmoji: { fontSize: 34, color: colors.muted },
  badge: { position: 'absolute', left: spacing.sm, bottom: spacing.sm, backgroundColor: colors.badgeBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { color: colors.badgeText, fontWeight: '900', fontSize: 12 },
  cardTitle: { fontSize: 15, fontWeight: '900', color: colors.text, marginTop: 2 },
  cardSubtitle: { marginTop: 4, color: colors.muted, fontSize: 12 },
  empty: { marginTop: spacing.lg, textAlign: 'center', color: colors.muted },
});

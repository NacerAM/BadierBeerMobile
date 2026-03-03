import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, ActivityIndicator, Image } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";
import { Glass, listGlassesApi } from "../../src/api/glassesApi";

export default function CataloguePublicScreen() {
  const [q, setQ] = useState("");
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
    if (!query) return items;
    return items.filter((g) => (g.name.toLowerCase().includes(query) || (g.Manufacturer?.name || "").toLowerCase().includes(query)));
  }, [q, items]);

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
        <Text style={styles.searchIcon}>⌥</Text>
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

      <View style={styles.bottomBar}>
        <Pressable style={styles.bottomItem} onPress={() => router.replace('/(visitor)/' as any)}>
          <Ionicons name="home" size={22} color={colors.text as any} />
          <Text style={styles.bottomLabel}>Accueil</Text>
        </Pressable>
        <Pressable style={styles.bottomItem} onPress={() => router.push('/(visitor)/explore' as any)}>
          <Ionicons name="compass" size={22} color={colors.text as any} />
          <Text style={styles.bottomLabel}>Explorer</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing.lg, paddingHorizontal: spacing.lg, backgroundColor: colors.bg },
  title: { fontSize: typography.h1, fontWeight: '900', color: colors.text, marginBottom: spacing.md, textAlign: 'center' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 16, marginBottom: spacing.lg, shadowColor: colors.shadow as any, shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  searchIcon: { color: colors.muted, fontSize: 16, fontWeight: '900' },
  search: { flex: 1, color: colors.text, paddingVertical: 2 },
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
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 64, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', paddingBottom: 6 },
  bottomItem: { alignItems: 'center' },
  bottomLabel: { color: colors.text, fontWeight: '700', marginTop: 2 },
});

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, ActivityIndicator, Image } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";
import { useCollection } from "../../../src/store/useCollection";
import { Glass, listGlassesApi } from "../../../src/api/glassesApi";

export default function CatalogueUserScreen() {
  const [q, setQ] = useState("");
  const { items: myCollection, refresh: refreshCollection, has } = useCollection();
  const [onlyMine, setOnlyMine] = useState(false);
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

  useEffect(() => { load(); refreshCollection(); }, [load]);
  useFocusEffect(useCallback(() => { load(); refreshCollection(); }, [load]));

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let base = items;
    if (onlyMine) {
      const ids = new Set(myCollection.map((r: any) => r.glassId));
      base = items.filter((g) => ids.has(g.id));
    }
    if (!query) return base;
    return base.filter((g) => (g.name.toLowerCase().includes(query) || (g.Manufacturer?.name || '').toLowerCase().includes(query)));
  }, [q, items, onlyMine, myCollection]);

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
      <Text style={styles.title}>Catalogue</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: spacing.md }}>
        <Pressable onPress={() => setOnlyMine(false)} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: !onlyMine ? colors.primary : 'transparent', borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: !onlyMine ? '#fff' : colors.text, fontWeight: '900', fontSize: 12 }}>Tous</Text>
        </Pressable>
        <Pressable onPress={() => setOnlyMine(true)} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: onlyMine ? colors.primary : 'transparent', borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: onlyMine ? '#fff' : colors.text, fontWeight: '900', fontSize: 12 }}>Ma collection</Text>
        </Pressable>
      </View>
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={colors.muted as any} />
        <TextInput value={q} onChangeText={setQ} placeholder="Rechercher…" placeholderTextColor={colors.muted} style={styles.search} autoCapitalize="none" />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator /><Text style={styles.centerText}>Chargement…</Text></View>
      ) : error ? (
        <View style={styles.center}><Text style={styles.errorText}>{error}</Text><Text style={styles.retry} onPress={load}>Réessayer</Text></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.md }}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => router.push({ pathname: '/(user)/glass/[id]', params: { id: String(item.id) } } as any)}>
              <View style={styles.cardImage}>
                {primaryImageUrl(item) ? (
                  <Image source={{ uri: primaryImageUrl(item)! }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                  <Text style={styles.cardImageEmoji}>🍺</Text>
                )}
                <View style={styles.badge}><Text style={styles.badgeText}>Validé</Text></View>
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
              {has(item.id) ? (
                <View style={{ marginTop: 6, alignSelf: "flex-start", backgroundColor: colors.successBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
                  <Text style={{ color: colors.successText, fontWeight: "900", fontSize: 10 }}>Dans ma collection</Text>
                </View>
              ) : null}
              <Text style={styles.cardSubtitle} numberOfLines={1}>{item.Manufacturer?.name || '—'}</Text>
              <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <StarsBar avg={item.avgRating} />
                <Text style={{ color: colors.muted, fontSize: 12 }}>({item.ratingsCount || 0})</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing.lg, paddingHorizontal: spacing.lg, backgroundColor: colors.bg },
  title: { fontSize: typography.h1, fontWeight: '800', color: colors.text, marginBottom: spacing.md, textAlign: 'center' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 16, marginBottom: spacing.lg },
  search: { flex: 1, color: colors.text, paddingVertical: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  centerText: { color: colors.muted },
  errorText: { color: colors.dangerText, fontWeight: '800', textAlign: 'center' },
  retry: { color: colors.primaryDark, fontWeight: '900' },
  list: { gap: spacing.md, paddingBottom: spacing.xl },
  card: { flex: 1, borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, padding: spacing.sm, shadowColor: colors.shadow as any, shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 8 } },
  cardImage: { height: 140, borderRadius: 14, backgroundColor: colors.bg2, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm, overflow: 'hidden' },
  cardImageEmoji: { fontSize: 34, color: colors.muted },
  badge: { position: 'absolute', left: spacing.sm, bottom: spacing.sm, backgroundColor: colors.badgeBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { color: colors.badgeText, fontWeight: '900', fontSize: 12 },
  cardTitle: { fontSize: 15, fontWeight: '900', color: colors.text, marginTop: 2 },
  cardSubtitle: { marginTop: 4, color: colors.muted, fontSize: 12 },
});

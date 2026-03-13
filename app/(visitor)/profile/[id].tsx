import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image, FlatList, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";
import { getPublicUserApi, listUserCollectionApi, PublicUser } from "../../../src/api/usersApi";

export default function PublicProfileVisitorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = Number(id);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try { setLoading(true); setError(null); const u = await getPublicUserApi(userId); const c = await listUserCollectionApi(userId); setUser(u); setItems(c.items || []); } catch (e: any) { setError(e?.message || 'Erreur'); } finally { setLoading(false); }
  }, [userId]);
  useEffect(() => { load(); }, [load]);

  const primaryImageUrl = (g: any) => g?.images?.find((i: any) => i.isPrimary)?.url || g?.images?.[0]?.url || null;

  if (loading) return <View style={styles.center}><ActivityIndicator /><Text style={styles.muted}>Chargement…</Text></View>;
  if (error || !user) return <View style={styles.center}><Text style={styles.error}>{error || 'Profil introuvable'}</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={styles.back}>‹</Text></Pressable>
        <Text style={styles.title}>Profil</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.header}>
        {user.avatarUrl ? <Image source={{ uri: user.avatarUrl }} style={styles.avatar} /> : <View style={[styles.avatar, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg2 }]}><Text style={{ fontSize: 26 }}>🙂</Text></View>}
        <View style={{ flex: 1 }}>
          <Text style={styles.username}>@{user.username}</Text>
        <Text style={{ marginHorizontal: spacing.lg, marginTop: spacing.md, color: colors.text }}>{user.bio || ''}</Text>
      </View>
      </View>

      <Text style={{ marginHorizontal: spacing.lg, marginTop: spacing.md, fontWeight: '900', color: colors.text }}>Collection</Text>
      <FlatList
        data={items}
        keyExtractor={(it) => String(it.glassId)}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push({ pathname: '/(visitor)/glass/[id]', params: { id: String(item.Glass.id) } } as any)} style={styles.card}>
            <View style={styles.cardImage}>
              {primaryImageUrl(item.Glass) ? (<Image source={{ uri: primaryImageUrl(item.Glass)! }} style={{ width: '100%', height: '100%' }} />) : (<Text style={{ fontSize: 26 }}>🍺</Text>)}
            </View>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.Glass.name}</Text>
            <Text style={styles.cardSubtitle} numberOfLines={1}>{item.Glass.Manufacturer?.name || '—'}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: { paddingTop: spacing.xl, paddingHorizontal: spacing.lg, paddingBottom: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 26, fontWeight: '900', color: colors.text, marginTop: -2 },
  title: { fontSize: typography.h1, fontWeight: '900', color: colors.text },
  header: { marginTop: spacing.lg, marginHorizontal: spacing.lg, flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  username: { fontSize: 18, fontWeight: '900', color: colors.text },
  muted: { color: colors.muted },
  error: { color: colors.dangerText, fontWeight: '900' },
  card: { borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, padding: spacing.sm },
  cardImage: { height: 120, borderRadius: 10, backgroundColor: colors.bg2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 8 },
  cardTitle: { fontWeight: '900', color: colors.text },
  cardSubtitle: { color: colors.muted, marginTop: 2 },
});



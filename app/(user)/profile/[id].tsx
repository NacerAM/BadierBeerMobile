import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image, FlatList, Pressable, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";
import Button from "../../../src/components/Button";
import { getPublicUserApi, listUserCollectionApi, PublicUser } from "../../../src/api/usersApi";
import { openMessageConversationApi } from "../../../src/api/messagesApi";
import { useAuth } from "../../../src/store/useAuth";

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = Number(id);
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contacting, setContacting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const u = await getPublicUserApi(userId);
      const c = await listUserCollectionApi(userId);
      setUser(u); setItems(c.items || []);
    } catch (e: any) { setError(e?.message || 'Erreur'); } finally { setLoading(false); }
  }, [userId]);
  useEffect(() => { load(); }, [load]);

  const primaryImageUrl = (g: any) => g?.images?.find((i: any) => i.isPrimary)?.url || g?.images?.[0]?.url || null;
  const canAdminContact = authUser?.role === 'ADMIN' && authUser?.id !== userId;

  async function onContact() {
    try {
      setContacting(true);
      const conversation = await openMessageConversationApi({ targetType: 'DIRECT', targetId: userId });
      router.push({ pathname: '/(user)/chat/[id]', params: { id: String(conversation.id) } } as any);
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || "Impossible d'ouvrir cette conversation");
    } finally {
      setContacting(false);
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator /><Text style={styles.muted}>Chargement…</Text></View>;
  if (error || !user) return <View style={styles.center}><Text style={styles.error}>{error || 'Profil introuvable'}</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}><Ionicons name="chevron-back" size={20} color={colors.text as any} /></Pressable>
        <Text style={styles.title}>Profil</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.header}>
        {user.avatarUrl ? <Image source={{ uri: user.avatarUrl }} style={styles.avatar} /> : <View style={[styles.avatar, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg2 }]}><Text style={{ fontSize: 26 }}>🙂</Text></View>}
        <View style={{ flex: 1 }}>
          <Text style={styles.username}>@{user.username}</Text>
          <Text style={styles.muted}>Membre depuis {new Date(user.createdAt || '').toLocaleDateString()}</Text>
          <Text style={{ marginTop: spacing.md, color: colors.text }}>{user.bio || ''}</Text>
          {canAdminContact ? <Button label={contacting ? 'Ouverture...' : `Contacter ${user.username}`} onPress={onContact} style={styles.contactButton} disabled={contacting} /> : null}
        </View>
      </View>

      <Text style={{ marginHorizontal: spacing.lg, marginTop: spacing.md, fontWeight: '900', color: colors.text }}>Collection</Text>
      <FlatList
        data={items}
        keyExtractor={(it) => String(it.glassId)}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push({ pathname: '/(user)/glass/[id]', params: { id: String(item.Glass.id) } } as any)} style={styles.card}>
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
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', shadowColor: colors.shadow as any, shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  title: { fontSize: typography.h1, fontWeight: '900', color: colors.text },
  header: { marginTop: spacing.lg, marginHorizontal: spacing.lg, flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  username: { fontSize: 18, fontWeight: '900', color: colors.text },
  muted: { color: colors.muted },
  error: { color: colors.dangerText, fontWeight: '900' },
  contactButton: { marginTop: spacing.md },
  card: { borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, padding: spacing.sm },
  cardImage: { height: 120, borderRadius: 10, backgroundColor: colors.bg2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 8 },
  cardTitle: { fontWeight: '900', color: colors.text },
  cardSubtitle: { color: colors.muted, marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

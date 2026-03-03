import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Image } from "react-native";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";
import Button from "../../../src/components/Button";
import { useAuth } from "../../../src/store/useAuth";
import { router } from "expo-router";

export default function Profile() {
  const { user, logout } = useAuth();

  async function onLogout() {
    await logout();
    router.replace("/(visitor)/" as any);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Profil</Text>
      </View>

      <View style={styles.headerCard}>
        <View style={styles.avatarWrap}>
          {user?.avatarUrl ? (<Image source={{ uri: (user as any).avatarUrl }} style={styles.avatar} />) : (<View style={styles.avatar}><Text style={{ fontSize: 34 }}>??</Text></View>)}
          <View style={styles.badge}><Text style={styles.badgeText}>?</Text></View>
        </View>
        <Text style={styles.name}>{user?.username || "Utilisateur"}</Text>
        <Text style={styles.email}>{user?.email || "—"}</Text>
        <View style={{ marginTop: spacing.sm }}>
          <Button label="Éditer" variant="secondary" onPress={() => router.push("/(user)/(tabs)/edit-profile" as any)} />
        </View>
      </View>

      <View style={styles.item}>
        <Text style={styles.itemTitle}>Mes statistiques</Text>
        <Text style={styles.itemSub}>Merci pour votre proposition ! Nous étudions…</Text>
        <Text style={styles.itemArrow}>›</Text>
      </View>

      <Pressable style={styles.item} onPress={() => router.push("/(user)/(tabs)/proposals" as any)}>
        <Text style={styles.itemTitle}>Suivi des propositions</Text>
        <Text style={styles.itemSub}>Consultez l’état de vos propositions</Text>
        <Text style={styles.itemArrow}>›</Text>
      </Pressable>

      <View style={styles.item}>
        <Text style={styles.itemTitle}>Favoris et paramètres</Text>
        <Text style={styles.itemSub}>Préférences, notifications, etc.</Text>
        <Text style={styles.itemArrow}>›</Text>
      </View>

      <View style={{ marginTop: spacing.lg }}>
        <Button label="Se déconnecter" onPress={onLogout} />
      </View>

      <Pressable style={{ marginTop: spacing.sm }} onPress={() => router.back()}>
        <Text style={{ textAlign: 'center', color: colors.muted }}>Annuler</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: { paddingTop: spacing.xl, paddingBottom: spacing.md, alignItems: 'center' },
  topTitle: { fontSize: typography.h1, fontWeight: '900', color: colors.text },
  headerCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    shadowColor: colors.shadow as any,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  avatarWrap: { position: 'relative' },
  avatar: { width: 86, height: 86, borderRadius: 43, backgroundColor: colors.bg2, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', right: -2, bottom: 2, backgroundColor: colors.badgeBg, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: colors.badgeText, fontWeight: '900', fontSize: 12 },
  name: { marginTop: spacing.sm, fontSize: 22, fontWeight: '900', color: colors.text },
  email: { marginTop: 2, color: colors.muted },
  item: {
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow as any,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  itemTitle: { fontWeight: '900', color: colors.text },
  itemSub: { color: colors.muted, marginTop: 2 },
  itemArrow: { position: 'absolute', right: spacing.md, top: '50%', marginTop: -14, fontSize: 26, color: colors.muted, fontWeight: '900' },
});


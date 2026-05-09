import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Image, Modal } from "react-native";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";
import Button from "../../../src/components/Button";
import { useAuth } from "../../../src/store/useAuth";
import { router, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getMyStatsApi, MyStats } from "../../../src/api/usersApi";
import { listNotificationsApi } from "../../../src/api/notificationsApi";

export default function Profile() {
  const { user, logout } = useAuth();
  const [viewerVisible, setViewerVisible] = useState(false);
  const [stats, setStats] = useState<MyStats | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const isBrewer = user?.role === "BREWER";
  const isAdmin = user?.role === "ADMIN";

  const load = useCallback(async () => {
    try {
      const [statsRes, notificationsRes] = await Promise.all([
        getMyStatsApi(),
        listNotificationsApi(),
      ]);
      setStats(statsRes);
      setUnreadCount(notificationsRes.unreadCount ?? 0);
    } catch {
      setStats(null);
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function onLogout() {
    await logout();
    router.replace("/(visitor)/" as any);
  }

  function formatRating(value: number | null | undefined) {
    return value != null ? `${value.toFixed(2)}/5` : "—";
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>{isAdmin ? "Profil administrateur" : "Profil"}</Text>
      </View>

      {isAdmin ? (
        <Pressable style={styles.adminHero} onPress={() => router.push("/(user)/(tabs)/admin" as any)}>
          <Text style={styles.adminHeroEyebrow}>Compte administrateur</Text>
          <Text style={styles.adminHeroTitle}>Acceder a l'espace administrateur</Text>
          <Text style={styles.adminHeroText}>Validation des comptes, verres et evenements.</Text>
          <Text style={styles.adminHeroArrow}>›</Text>
        </Pressable>
      ) : null}

      <View style={styles.headerCard}>
        <View style={styles.avatarWrap}>
          {user?.avatarUrl ? (
            <Pressable onPress={() => setViewerVisible(true)} hitSlop={10}>
              <Image source={{ uri: (user as any).avatarUrl }} style={styles.avatar} />
            </Pressable>
          ) : (
            <View style={styles.avatar}><Text style={{ fontSize: 34 }}>🙂</Text></View>
          )}
          <View style={styles.badge}><Text style={styles.badgeText}>✓</Text></View>
        </View>
        <Text style={styles.name}>{user?.username || "Utilisateur"}</Text>
        <Text style={styles.email}>{user?.email || "—"}</Text>
        <Text style={styles.roleLine}>Role: {user?.role || "—"}</Text>
        {(user as any)?.bio ? <Text style={{ marginTop: spacing.sm, color: colors.text, textAlign: "center" }}>{(user as any).bio}</Text> : null}
        <View style={{ marginTop: spacing.sm }}>
          <Button label="Editer" variant="secondary" onPress={() => router.push("/(user)/(tabs)/edit-profile" as any)} />
        </View>
      </View>

      <View style={styles.item}>
        <Text style={styles.itemTitle}>Mes statistiques</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatRating(stats?.averageRating)}</Text>
            <Text style={styles.statLabel}>Note moyenne</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatRating(stats?.bestRating)}</Text>
            <Text style={styles.statLabel}>Meilleure note</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats?.totalPublications ?? 0}</Text>
            <Text style={styles.statLabel}>Publications</Text>
          </View>
        </View>
      </View>

      {isAdmin ? (
        <Pressable style={styles.item} onPress={() => router.push("/(user)/(tabs)/admin" as any)}>
          <Text style={styles.itemTitle}>Espace administrateur</Text>
          <Text style={styles.itemSub}>Validation des comptes, verres et evenements</Text>
          <Text style={styles.itemArrow}>›</Text>
        </Pressable>
      ) : null}

      <Pressable style={styles.item} onPress={() => router.push("/(user)/notifications" as any)}>
        <Text style={styles.itemTitle}>Notifications</Text>
        <Text style={styles.itemSub}>{unreadCount} notification{unreadCount > 1 ? "s" : ""} non lue{unreadCount > 1 ? "s" : ""}</Text>
        <Text style={styles.itemArrow}>›</Text>
      </Pressable>

      <Pressable style={styles.item} onPress={() => router.push("/(user)/(tabs)/proposals" as any)}>
        <Text style={styles.itemTitle}>Suivi des propositions</Text>
        <Text style={styles.itemSub}>Consultez l'etat de vos propositions</Text>
        <Text style={styles.itemArrow}>›</Text>
      </Pressable>

      {isBrewer ? (
        <Pressable style={styles.item} onPress={() => router.push("/(user)/(tabs)/brewer" as any)}>
          <Text style={styles.itemTitle}>Espace brasseur</Text>
          <Text style={styles.itemSub}>Produits, evenements et suivi de vos contenus</Text>
          <Text style={styles.itemArrow}>›</Text>
        </Pressable>
      ) : null}

      <Pressable style={styles.item} onPress={() => router.push("/(user)/(tabs)/settings" as any)}>
        <Text style={styles.itemTitle}>Favoris et parametres</Text>
        <Text style={styles.itemSub}>Changer le mot de passe, preferences...</Text>
        <Text style={styles.itemArrow}>›</Text>
      </Pressable>

      <View style={{ marginTop: spacing.lg }}>
        <Button label="Se deconnecter" onPress={onLogout} />
      </View>

      <Pressable style={{ marginTop: spacing.sm }} onPress={() => router.back()}>
        <Text style={{ textAlign: "center", color: colors.muted }}>Annuler</Text>
      </Pressable>

      <Modal visible={viewerVisible} transparent animationType="fade" onRequestClose={() => setViewerVisible(false)}>
        <View style={styles.viewerOverlay}>
          {user?.avatarUrl ? <Image source={{ uri: (user as any).avatarUrl }} style={styles.viewerImage} resizeMode="contain" /> : null}
          <Pressable onPress={() => setViewerVisible(false)} style={styles.viewerClose} hitSlop={20}>
            <View style={styles.viewerCloseCircle}><Ionicons name="close" size={18} color="#000" /></View>
          </Pressable>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: { paddingTop: spacing.xl, paddingBottom: spacing.md, alignItems: "center" },
  topTitle: { fontSize: typography.h1, fontWeight: "900", color: colors.text },
  adminHero: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    position: "relative",
  },
  adminHeroEyebrow: { color: colors.primaryDark, fontWeight: "900", fontSize: 12, textTransform: "uppercase" },
  adminHeroTitle: { color: colors.text, fontWeight: "900", fontSize: 20, marginTop: spacing.xs },
  adminHeroText: { color: colors.text, marginTop: spacing.sm, lineHeight: 20, paddingRight: 24 },
  adminHeroArrow: { position: "absolute", right: spacing.lg, top: "50%", marginTop: -16, fontSize: 30, color: colors.primaryDark, fontWeight: "900" },
  headerCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    shadowColor: colors.shadow as any,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  avatarWrap: { position: "relative" },
  avatar: { width: 86, height: 86, borderRadius: 43, backgroundColor: colors.bg2, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", right: -2, bottom: 2, backgroundColor: colors.badgeBg, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: colors.badgeText, fontWeight: "900", fontSize: 12 },
  name: { marginTop: spacing.sm, fontSize: 22, fontWeight: "900", color: colors.text },
  email: { marginTop: 2, color: colors.muted },
  roleLine: { marginTop: spacing.xs, color: colors.primaryDark, fontWeight: "900" },
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
  itemTitle: { fontWeight: "900", color: colors.text },
  itemSub: { color: colors.muted, marginTop: 2 },
  itemArrow: { position: "absolute", right: spacing.md, top: "50%", marginTop: -14, fontSize: 26, color: colors.muted, fontWeight: "900" },
  statsRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  statBox: { flex: 1, backgroundColor: colors.bg2, borderRadius: 14, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, alignItems: "center" },
  statValue: { color: colors.text, fontWeight: "900", fontSize: 18 },
  statLabel: { color: colors.muted, marginTop: 4, fontSize: 12, textAlign: "center" },
  viewerOverlay: { flex: 1, backgroundColor: "black", alignItems: "center", justifyContent: "center" },
  viewerImage: { width: "100%", height: "100%" },
  viewerClose: { position: "absolute", top: 40, right: 16, zIndex: 5, elevation: 5 },
  viewerCloseCircle: { backgroundColor: "#fff", borderRadius: 999, padding: 6, borderWidth: 1, borderColor: "#e5e5e5", shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 6 },
});

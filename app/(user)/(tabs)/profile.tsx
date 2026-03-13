import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Image, Modal } from "react-native";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";
import Button from "../../../src/components/Button";
import { useAuth } from "../../../src/store/useAuth";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Profile() {
  const { user, logout } = useAuth();
  const [viewerVisible, setViewerVisible] = useState(false);

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
        {(user as any)?.bio ? (<Text style={{ marginTop: spacing.sm, color: colors.text, textAlign: "center" }}>{(user as any).bio}</Text>) : null}
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

      <Pressable style={styles.item} onPress={() => router.push("/(user)/(tabs)/settings" as any)}>
        <Text style={styles.itemTitle}>Favoris et paramètres</Text>
        <Text style={styles.itemSub}>Changer le mot de passe, préférences…</Text>
        <Text style={styles.itemArrow}>›</Text>
      </Pressable>

      <View style={{ marginTop: spacing.lg }}>
        <Button label="Se déconnecter" onPress={onLogout} />
      </View>

      <Pressable style={{ marginTop: spacing.sm }} onPress={() => router.back()}>
        <Text style={{ textAlign: 'center', color: colors.muted }}>Annuler</Text>
      </Pressable>

      <Modal visible={viewerVisible} transparent animationType="fade" onRequestClose={() => setViewerVisible(false)}>
        <View style={styles.viewerOverlay}>
          {user?.avatarUrl ? (
            <Image source={{ uri: (user as any).avatarUrl }} style={styles.viewerImage} resizeMode="contain" />
          ) : null}
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

  viewerOverlay: { flex: 1, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center' },
  viewerImage: { width: '100%', height: '100%' },
  viewerClose: {  position: 'absolute', top: 40, right: 16 , zIndex: 5, elevation: 5 },
  viewerCloseText: { color: "#fff", fontSize: 30, fontWeight: "900" },
  viewerCloseCircle: { backgroundColor: "#fff", borderRadius: 999, padding: 6, borderWidth: 1, borderColor: "#e5e5e5", shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 6 },
});







import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, Pressable } from "react-native";
import { Link, router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";
import Button from "../../src/components/Button";
import { useAuth } from "../../src/store/useAuth";
import { healthApi } from "../../src/api/healthApi";
import { listGlassesApi, Glass } from "../../src/api/glassesApi";

export default function HomeVisitorScreen() {
  const { user, isLoggedIn } = useAuth();
  const [topItems, setTopItems] = useState<Glass[]>([]);

  useEffect(() => { (async () => { try { await healthApi(); } catch {} })(); }, []);
  useEffect(() => { (async () => { try { const res = await listGlassesApi(1, 8, "rating"); setTopItems(res.items || []); } catch {} })(); }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: spacing.xxl + 70 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Badier Beer</Text>
          <Pressable onPress={() => (isLoggedIn ? router.push("/(user)/(tabs)/profile" as any) : router.push("/(visitor)/login"))} style={styles.headerIcon} hitSlop={10}>
            {user?.avatarUrl ? (
              <Image source={{ uri: (user as any).avatarUrl }} style={styles.headerAvatar} />
            ) : (
              <Ionicons name="person-circle" color={colors.text as any} size={24} />
            )}
          </Pressable>
        </View>

        {/* Hero image */}
        <View style={styles.heroImageWrap}>
          <Image source={require("../../assets/images/hero-beer.jpg")} style={styles.heroImage} resizeMode="cover" />
        </View>

        {/* Hero text block */}
        <View style={styles.paperBlock}>
          <Text style={styles.heroTitle}>Découvrez et gérez votre</Text>
          <Text style={styles.heroTitle}>collection de verres de bière</Text>
          <Text style={styles.heroSubtitle}>Catalogue collaboratif validé par des experts</Text>
          <View style={{ marginTop: spacing.lg }}>
            <Button label="Consulter le catalogue" onPress={() => router.push("/(visitor)/catalogue")} />
          </View>
          <View style={styles.secondaryActions}>
            <Button label="Créer un compte" variant="secondary" onPress={() => router.push("/(visitor)/register")} />
            <Link href="/(visitor)/login" style={styles.loginLink}>Se connecter</Link>
          </View>
        </View>

        <View style={{ marginTop: spacing.sm }}>
          <Button label="Proposer un verre" variant="secondary" onPress={() => router.push({ pathname: "/(visitor)/login", params: { redirect: "/(user)/(tabs)/propose" } } as any)} />
        </View>

        {/* Meilleurs notés */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Les mieux notés</Text>
          <Pressable onPress={() => router.push("/(visitor)/catalogue")} hitSlop={10}>
            <Text style={styles.sectionLink}>›</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsRow}>
          {topItems.map((g) => (
            <Pressable key={g.id} style={styles.card} onPress={() => router.push({ pathname: "/(visitor)/glass/[id]", params: { id: String(g.id) } } as any)}>
              <View style={styles.cardImagePlaceholder}>
                {g.images?.length ? (
                  <Image source={{ uri: (g.images.find((i) => i.isPrimary) || g.images[0]).url }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                ) : (
                  <Text style={{ color: colors.muted, fontSize: 28 }}>🍺</Text>
                )}
              </View>
              <View style={styles.badge}><Text style={styles.badgeText}>Validé</Text></View>
              <Text style={styles.cardTitle} numberOfLines={1}>{g.name}</Text>
              <Text style={styles.cardSub} numberOfLines={1}>{g.Manufacturer?.name || "—"}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable style={styles.bottomItem} onPress={() => router.replace('/(visitor)/' as any)}>
          <Ionicons name='home' size={22} color={colors.text as any} />
          <Text style={styles.bottomLabel}>Accueil</Text>
        </Pressable>
        <Pressable style={styles.bottomItem} onPress={() => router.push('/(visitor)/explore' as any)}>
          <Ionicons name='compass' size={22} color={colors.text as any} />
          <Text style={styles.bottomLabel}>Explorer</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { paddingBottom: spacing.xxl },
  header: { paddingTop: spacing.xl, paddingHorizontal: spacing.lg, paddingBottom: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: 0.3 },
  headerIcon: { position: 'absolute', right: spacing.lg, top: spacing.xl, width: 40, height: 40, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', shadowColor: colors.shadow as any, shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 4, overflow: 'hidden' },
  headerAvatar: { width: 36, height: 36, borderRadius: 10 },
  headerIconText: { fontSize: 18 },
  heroImageWrap: { marginHorizontal: spacing.lg, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, shadowColor: colors.shadow as any, shadowOpacity: 0.25, shadowRadius: 14, shadowOffset: { width: 0, height: 10 }, elevation: 5 },
  heroImage: { width: '100%', height: 210 },
  paperBlock: { marginTop: spacing.lg, marginHorizontal: spacing.lg, padding: spacing.lg, borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, shadowColor: colors.shadow as any, shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  heroTitle: { fontSize: 22, fontWeight: '900', color: colors.text, textAlign: 'center', lineHeight: 28 },
  heroSubtitle: { marginTop: spacing.sm, color: colors.muted, textAlign: 'center', lineHeight: 20 },
  secondaryActions: { marginTop: spacing.lg, gap: spacing.sm },
  loginLink: { textAlign: 'center', color: colors.primaryDark, fontWeight: '800', marginTop: 2 },
  sectionHeader: { marginTop: spacing.xl, marginHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: typography.h2, fontWeight: '900', color: colors.text },
  sectionLink: { fontSize: 26, color: colors.muted, fontWeight: '900' },
  cardsRow: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md },
  card: { width: 140, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, padding: spacing.sm, shadowColor: colors.shadow as any, shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  cardImagePlaceholder: { height: 120, borderRadius: 12, backgroundColor: colors.bg2, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm, overflow: 'hidden' },
  badge: { position: 'absolute', top: 88, left: spacing.sm, backgroundColor: colors.badgeBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { color: colors.badgeText, fontWeight: '900', fontSize: 12 },
  cardTitle: { fontWeight: '900', color: colors.text, marginTop: 6 },
  cardSub: { color: colors.muted, marginTop: 2, fontSize: 12 },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 64, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', paddingBottom: 6 },
  bottomItem: { alignItems: 'center' },
  bottomLabel: { color: colors.text, fontWeight: '700', marginTop: 2 },
});

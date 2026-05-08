import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../src/store/useAuth";
import { View, Text, StyleSheet, Image, ScrollView, Pressable } from "react-native";
import { router, useFocusEffect } from "expo-router";
import Button from "../../../src/components/Button";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";
import { listGlassesApi, Glass } from "../../../src/api/glassesApi";

export default function UserHomeScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<Glass[]>([]);
  const [loading, setLoading] = useState(true);
  const isBrewer = user?.role === "BREWER";

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const glassesRes = await listGlassesApi(1, 8, "rating");
      setItems(glassesRes.items ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Badier Beer</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.heroImageWrap}>
        <Image
          source={require("../../../assets/images/hero-beer.jpg")}
          style={styles.heroImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.paperBlock}>
        <Text style={styles.heroTitle}>Bonjour {user?.username ?? "!"}</Text>
        <Text style={styles.heroSubtitle}>
          Pret a decouvrir et partager votre passion pour les verres de biere ?
        </Text>

        <View style={{ marginTop: spacing.lg }}>
          <Button label="Ma collection" onPress={() => router.push("/(user)/(tabs)/collection" as any)} />
        </View>

        <View style={styles.secondaryActions}>
          <Button
            label="Consulter le catalogue"
            variant="secondary"
            onPress={() => router.push("/(user)/(tabs)/catalogue" as any)}
          />
        </View>
        <View style={{ marginTop: spacing.sm }}>
          <Button
            label="Proposer un verre"
            variant="secondary"
            onPress={() => router.push("/(user)/(tabs)/propose" as any)}
          />
        </View>
        {isBrewer ? (
          <View style={{ marginTop: spacing.sm }}>
            <Button
              label="Espace brasseur"
              variant="secondary"
              onPress={() => router.push("/(user)/(tabs)/brewer" as any)}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Derniers meilleurs verres valides</Text>
        <Pressable onPress={() => router.push("/(user)/(tabs)/catalogue" as any)} hitSlop={10}>
          <Text style={styles.sectionLink}>›</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsRow}>
        {items.map((g) => (
          <Pressable
            key={g.id}
            style={styles.card}
            onPress={() => router.push({ pathname: "/(user)/glass/[id]", params: { id: String(g.id) } } as any)}
          >
            {(g.images && g.images.length) ? (
              <Image source={{ uri: (g.images.find(i => i.isPrimary) || g.images[0]).url }} style={{ width: 140, height: 110, borderRadius: 12 }} />
            ) : (
              <View style={styles.cardImagePlaceholder}>
                <Text style={{ color: colors.muted, fontSize: 28 }}>🍺</Text>
              </View>
            )}

            <View style={styles.badge}>
              <Text style={styles.badgeText}>Valide</Text>
            </View>

            <Text style={styles.cardTitle} numberOfLines={1}>{g.name}</Text>
            <Text style={styles.cardSub} numberOfLines={1}>{g.Manufacturer?.name || "—"}</Text>
          </Pressable>
        ))}
        {items.length === 0 && !loading ? (
          <View style={[styles.card, { alignItems: "center", justifyContent: "center" }]}>
            <Text style={styles.cardSub}>Aucun verre a afficher</Text>
          </View>
        ) : null}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: spacing.xxl },
  header: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: 0.3,
  },
  heroImageWrap: {
    marginHorizontal: spacing.lg,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    shadowColor: colors.shadow as any,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  heroImage: { width: "100%", height: 210 },
  paperBlock: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow as any,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
    lineHeight: 28,
  },
  heroSubtitle: {
    marginTop: spacing.sm,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 20,
  },
  secondaryActions: { marginTop: spacing.lg, gap: spacing.sm },
  sectionHeader: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: typography.h2,
    fontWeight: "900",
    color: colors.text,
  },
  sectionLink: { fontSize: 26, color: colors.muted, fontWeight: "900" },
  cardsRow: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md },
  card: {
    width: 160,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    shadowColor: colors.shadow as any,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardImagePlaceholder: {
    height: 110,
    borderRadius: 12,
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  badge: {
    position: "absolute",
    top: 88,
    left: spacing.sm,
    backgroundColor: colors.badgeBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { color: colors.badgeText, fontWeight: "900", fontSize: 12 },
  cardTitle: { fontWeight: "900", color: colors.text, marginTop: 6 },
  cardSub: { color: colors.muted, marginTop: 2, fontSize: 12 },
});

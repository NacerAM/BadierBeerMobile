import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image, ScrollView, Pressable } from "react-native";
import { Link, router } from "expo-router";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";
import Button from "../../src/components/Button";
import { healthApi } from "../../src/api/healthApi";

export default function HomeVisitorScreen() {
  useEffect(() => {
    async function test() {
      try {
        const res = await healthApi();
        console.log("HEALTH OK:", res);
      } catch (err) {
        console.log("HEALTH ERROR:", err);
      }
    }
    test();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Badier Beer</Text>

        <Pressable
          onPress={() => router.push("/(visitor)/login")}
          style={styles.headerIcon}
          hitSlop={10}
        >
          <Text style={styles.headerIconText}>👤</Text>
        </Pressable>
      </View>

      {/* Hero image */}
      <View style={styles.heroImageWrap}>
        <Image
          source={require("../../assets/images/hero-beer.jpg")}
          style={styles.heroImage}
          resizeMode="cover"
        />
      </View>

      {/* Hero text block */}
      <View style={styles.paperBlock}>
        <Text style={styles.heroTitle}>Découvrez et gérez votre</Text>
        <Text style={styles.heroTitle}>collection de verres de bière</Text>

        <Text style={styles.heroSubtitle}>
          Catalogue collaboratif validé par des experts
        </Text>

        <View style={{ marginTop: spacing.lg }}>
          <Button
            label="Consulter le catalogue"
            onPress={() => router.push("/(visitor)/catalogue")}
          />
        </View>

        <View style={styles.secondaryActions}>
          <Button
            label="Créer un compte"
            variant="secondary"
            onPress={() => router.push("/(visitor)/register")}
          />

          <Link href="/(visitor)/login" style={styles.loginLink}>
            Se connecter
          </Link>
        </View>
      </View>

      {/* Derniers verres validés (placeholder premium) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Derniers verres validés</Text>
        <Pressable onPress={() => router.push("/(visitor)/catalogue")} hitSlop={10}>
          <Text style={styles.sectionLink}>›</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsRow}>
        <GlassCard />
        <GlassCard />
        <GlassCard />
        <GlassCard />
      </ScrollView>
    </ScrollView>
  );
}

function GlassCard() {
  return (
    <View style={styles.card}>
      <View style={styles.cardImagePlaceholder}>
        <Text style={{ color: colors.muted, fontSize: 28 }}>🍺</Text>
      </View>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>Validé</Text>
      </View>

      <Text style={styles.cardTitle}>Nom du verre</Text>
      <Text style={styles.cardSub}>Fabricant</Text>
    </View>
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
  headerIcon: {
    position: "absolute",
    right: spacing.lg,
    top: spacing.xl,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadow as any,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  headerIconText: { fontSize: 18 },

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

  secondaryActions: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  loginLink: {
    textAlign: "center",
    color: colors.primaryDark,
    fontWeight: "800",
    marginTop: 2,
  },

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
  sectionLink: {
    fontSize: 26,
    color: colors.muted,
    fontWeight: "900",
  },

  cardsRow: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  card: {
    width: 140,
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
    height: 120,
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
    backgroundColor: "#5B3A1E",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { color: "#FFF", fontWeight: "900", fontSize: 12 },

  cardTitle: { fontWeight: "900", color: colors.text, marginTop: 6 },
  cardSub: { color: colors.muted, marginTop: 2, fontSize: 12 },
});
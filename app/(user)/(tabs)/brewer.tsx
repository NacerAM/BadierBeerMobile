import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "../../../src/store/useAuth";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";
import { getMyBreweryApi, BrewerySummary } from "../../../src/api/brewerApi";
import Button from "../../../src/components/Button";

export default function BrewerScreen() {
  const { user } = useAuth();
  const [brewery, setBrewery] = useState<BrewerySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getMyBreweryApi();
        setBrewery(res);
      } catch {
        setBrewery(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (user?.role !== "BREWER") {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Espace brasseur</Text>
        <Text style={styles.subtitle}>Cet écran est réservé aux comptes société.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Espace brasseur</Text>
      <Text style={styles.subtitle}>Gérez vos propositions de verres, vos produits et vos événements.</Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Brasserie</Text>
        <Text style={styles.heroTitle}>{brewery?.name || "Chargement..."}</Text>
        <Text style={styles.heroMeta}>
          {loading ? "Chargement des informations..." : [brewery?.city, brewery?.country].filter(Boolean).join(", ") || "Informations de brasserie non renseignées"}
        </Text>
        {brewery?.websiteUrl ? <Text style={styles.heroLink}>{brewery.websiteUrl}</Text> : null}
      </View>

      <Pressable style={styles.actionCard} onPress={() => router.push("/(user)/(tabs)/propose" as any)}>
        <View style={styles.iconWrap}><Ionicons name="beer-outline" size={22} color={colors.primaryDark} /></View>
        <View style={styles.actionBody}>
          <Text style={styles.actionTitle}>Proposer un verre</Text>
          <Text style={styles.actionText}>Comme un utilisateur normal, avec suivi de validation.</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </Pressable>

      <Pressable style={styles.actionCard} onPress={() => router.push("/(user)/(tabs)/brewer-products" as any)}>
        <View style={styles.iconWrap}><Ionicons name="bag-handle-outline" size={22} color={colors.primaryDark} /></View>
        <View style={styles.actionBody}>
          <Text style={styles.actionTitle}>Produits à la vente</Text>
          <Text style={styles.actionText}>Proposez vos produits. Ils seront visibles après validation de l’admin.</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </Pressable>

      <Pressable style={styles.actionCard} onPress={() => router.push("/(user)/(tabs)/brewer-events" as any)}>
        <View style={styles.iconWrap}><Ionicons name="calendar-outline" size={22} color={colors.primaryDark} /></View>
        <View style={styles.actionBody}>
          <Text style={styles.actionTitle}>Événements</Text>
          <Text style={styles.actionText}>Proposez vos événements. Ils seront visibles après validation de l’admin.</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </Pressable>

      <View style={styles.tipBox}>
        <Text style={styles.tipTitle}>Validation</Text>
        <Text style={styles.tipText}>Les produits et événements restent en attente tant qu’un administrateur ne les a pas validés.</Text>
      </View>

      <Button label="Voir mes propositions de verres" variant="secondary" onPress={() => router.push("/(user)/(tabs)/proposals" as any)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, backgroundColor: colors.bg },
  title: { fontSize: typography.h1, fontWeight: "900", color: colors.text, marginBottom: spacing.sm },
  subtitle: { color: colors.muted, marginBottom: spacing.lg, lineHeight: 20 },
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroEyebrow: { color: colors.muted, fontWeight: "700", textTransform: "uppercase", fontSize: 12 },
  heroTitle: { color: colors.text, fontSize: 24, fontWeight: "900", marginTop: spacing.xs },
  heroMeta: { color: colors.muted, marginTop: spacing.sm },
  heroLink: { color: colors.primaryDark, marginTop: spacing.xs, fontWeight: "700" },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.bg2,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBody: { flex: 1 },
  actionTitle: { color: colors.text, fontWeight: "900", fontSize: 16 },
  actionText: { color: colors.muted, marginTop: 4, lineHeight: 19 },
  arrow: { fontSize: 28, color: colors.muted, fontWeight: "900" },
  tipBox: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipTitle: { color: colors.text, fontWeight: "900", marginBottom: 4 },
  tipText: { color: colors.muted, lineHeight: 19 },
});

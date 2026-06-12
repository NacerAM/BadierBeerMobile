import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AdminStatsResponse, getAdminStatsApi } from "../../src/api/adminApi";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";

function formatDuration(seconds?: number | null) {
  if (seconds == null || Number.isNaN(seconds)) return "Aucune donnee";
  if (seconds < 60) return `${seconds} sec`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours <= 0) return `${minutes} min`;
  if (minutes <= 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

export default function AdminStatsScreen() {
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAdminStatsApi();
      setStats(response);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={10}>
          <Ionicons name="chevron-back" size={18} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Statistiques admin</Text>
        <View style={{ width: 42 }} />
      </View>

      <View style={styles.heroGrid}>
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Reponse moyenne</Text>
          <Text style={styles.heroValue}>{formatDuration(stats?.responseMetrics?.avgSeconds)}</Text>
        </View>
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Traitement moyen</Text>
          <Text style={styles.heroValue}>{formatDuration(stats?.processingMetrics?.avgSeconds)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Classements</Text>
        <Text style={styles.sectionSub}>Appuyez sur un bouton pour ouvrir le detail correspondant.</Text>
        {loading ? <Text style={styles.loading}>Chargement...</Text> : null}

        <Pressable style={styles.statButton} onPress={() => router.push({ pathname: "/(user)/admin-stats/[section]", params: { section: "profiles" } } as any)}>
          <View style={styles.statButtonTextWrap}>
            <Text style={styles.statButtonTitle}>Profils les plus actifs</Text>
            <Text style={styles.statButtonSub}>
              {stats?.activeProfiles?.length || 0} profil{(stats?.activeProfiles?.length || 0) > 1 ? "s" : ""} classes
            </Text>
          </View>
          <Text style={styles.linkArrow}>{">"}</Text>
        </Pressable>

        <Pressable style={styles.statButton} onPress={() => router.push({ pathname: "/(user)/admin-stats/[section]", params: { section: "publications" } } as any)}>
          <View style={styles.statButtonTextWrap}>
            <Text style={styles.statButtonTitle}>Publications les mieux notees</Text>
            <Text style={styles.statButtonSub}>
              {stats?.topRatedPublications?.length || 0} publication{(stats?.topRatedPublications?.length || 0) > 1 ? "s" : ""} classee{(stats?.topRatedPublications?.length || 0) > 1 ? "s" : ""}
            </Text>
          </View>
          <Text style={styles.linkArrow}>{">"}</Text>
        </Pressable>

        <Pressable style={styles.statButton} onPress={() => router.push({ pathname: "/(user)/admin-stats/[section]", params: { section: "events" } } as any)}>
          <View style={styles.statButtonTextWrap}>
            <Text style={styles.statButtonTitle}>Evenements les plus frequentes</Text>
            <Text style={styles.statButtonSub}>
              {stats?.topEvents?.length || 0} evenement{(stats?.topEvents?.length || 0) > 1 ? "s" : ""} classe{(stats?.topEvents?.length || 0) > 1 ? "s" : ""}
            </Text>
          </View>
          <Text style={styles.linkArrow}>{">"}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.xl, marginBottom: spacing.lg },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { flex: 1, textAlign: "center", color: colors.text, fontSize: typography.h1, fontWeight: "900" },
  heroGrid: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  heroCard: { flex: 1, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryDark, borderRadius: 18, padding: spacing.lg },
  heroLabel: { color: colors.primaryDark, fontWeight: "900", textTransform: "uppercase", fontSize: 12 },
  heroValue: { color: colors.text, fontWeight: "900", fontSize: 24, marginTop: spacing.sm },
  section: { marginBottom: spacing.lg },
  sectionTitle: { color: colors.text, fontWeight: "900", fontSize: 19 },
  sectionSub: { color: colors.muted, marginTop: spacing.xs, lineHeight: 19, marginBottom: spacing.md },
  statButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  statButtonTextWrap: { flex: 1 },
  statButtonTitle: { color: colors.text, fontWeight: "900", fontSize: 16 },
  statButtonSub: { color: colors.muted, marginTop: 4, fontWeight: "700" },
  linkArrow: { color: colors.muted, fontSize: 26, fontWeight: "900" },
  loading: { color: colors.muted, textAlign: "center", marginTop: spacing.sm, marginBottom: spacing.sm },
});

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

function formatDate(value?: string | null) {
  if (!value) return "A confirmer";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("fr-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function roleLabel(role: string) {
  if (role === "BREWER") return "Brasseur";
  if (role === "ADMIN") return "Admin";
  return "Utilisateur";
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
  useFocusEffect(useCallback(() => { load(); }, [load]));

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
        <Text style={styles.sectionTitle}>Profils les plus actifs</Text>
        <Text style={styles.sectionSub}>Classement selon les publications, messages, notes, collections et participations.</Text>
        {loading ? <Text style={styles.loading}>Chargement...</Text> : null}
        {stats?.activeProfiles?.map((item, index) => (
          <Pressable key={item.id} style={styles.rowCard} onPress={() => router.push({ pathname: "/(user)/profile/[id]", params: { id: String(item.id), fromAdmin: "1" } } as any)}>
            <View style={styles.rankBubble}><Text style={styles.rankText}>{index + 1}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.username}</Text>
              <Text style={styles.rowMeta}>{roleLabel(item.role)} · Score {item.activityScore}</Text>
              <Text style={styles.rowSub}>Publis {item.proposalsCount} · Messages {item.messagesCount} · Notes {item.ratingsCount}</Text>
            </View>
            <Text style={styles.linkArrow}>›</Text>
          </Pressable>
        ))}
        {!loading && !stats?.activeProfiles?.length ? <Text style={styles.empty}>Aucun profil actif a afficher.</Text> : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Publications les mieux notees</Text>
        <Text style={styles.sectionSub}>Moyenne la plus haute puis nombre de notes recues.</Text>
        {stats?.topRatedPublications?.map((item, index) => (
          <Pressable key={item.id} style={styles.rowCard} onPress={() => router.push({ pathname: "/(user)/glass/[id]", params: { id: String(item.id) } } as any)}>
            <View style={styles.rankBubble}><Text style={styles.rankText}>{index + 1}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.name}</Text>
              <Text style={styles.rowMeta}>{item.manufacturerName || "Brasserie inconnue"} · par {item.creatorUsername}</Text>
              <Text style={styles.rowSub}>{item.avgRating}/5 · {item.ratingsCount} note{item.ratingsCount > 1 ? "s" : ""}</Text>
            </View>
            <Text style={styles.linkArrow}>›</Text>
          </Pressable>
        ))}
        {!loading && !stats?.topRatedPublications?.length ? <Text style={styles.empty}>Aucune publication notee pour le moment.</Text> : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Evenements les plus frequentes</Text>
        <Text style={styles.sectionSub}>Classement selon le nombre de participants valides.</Text>
        {stats?.topEvents?.map((item, index) => (
          <Pressable key={item.id} style={styles.rowCard} onPress={() => router.push({ pathname: "/(user)/event/[id]", params: { id: String(item.id) } } as any)}>
            <View style={styles.rankBubble}><Text style={styles.rankText}>{index + 1}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowMeta}>{item.breweryName || "Badier Beer"}</Text>
              <Text style={styles.rowSub}>{item.participantsCount} participant{item.participantsCount > 1 ? "s" : ""} · {formatDate(item.startAt)}</Text>
            </View>
            <Text style={styles.linkArrow}>›</Text>
          </Pressable>
        ))}
        {!loading && !stats?.topEvents?.length ? <Text style={styles.empty}>Aucun evenement frequentable pour le moment.</Text> : null}
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
  rowCard: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: spacing.md, marginBottom: spacing.sm },
  rankBubble: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  rankText: { color: "#2E1A0F", fontWeight: "900" },
  rowTitle: { color: colors.text, fontWeight: "900", fontSize: 16 },
  rowMeta: { color: colors.muted, marginTop: 2, fontWeight: "700" },
  rowSub: { color: colors.text, marginTop: 4 },
  linkArrow: { color: colors.muted, fontSize: 26, fontWeight: "900" },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.sm },
  loading: { color: colors.muted, textAlign: "center", marginTop: spacing.sm },
});

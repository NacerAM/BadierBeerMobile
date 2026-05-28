import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AdminStatsResponse, getAdminStatsApi } from "../../../src/api/adminApi";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";

type SectionKey = "profiles" | "publications" | "events";

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

export default function AdminStatsSectionScreen() {
  const { section } = useLocalSearchParams<{ section?: string }>();
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const currentSection: SectionKey = useMemo(() => {
    if (section === "publications" || section === "events") return section;
    return "profiles";
  }, [section]);

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

  const headerTitle = currentSection === "profiles"
    ? "Profils les plus actifs"
    : currentSection === "publications"
      ? "Publications les mieux notees"
      : "Evenements les plus frequentes";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={10}>
          <Ionicons name="chevron-back" size={18} color={colors.text} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>{headerTitle}</Text>
        <View style={{ width: 42 }} />
      </View>

      {loading ? <Text style={styles.loading}>Chargement...</Text> : null}

      {currentSection === "profiles" ? (
        <>
          {stats?.activeProfiles?.map((item, index) => (
            <Pressable
              key={item.id}
              style={styles.rowCard}
              onPress={() => router.push({ pathname: "/(user)/profile/[id]", params: { id: String(item.id), fromAdmin: "1" } } as any)}
            >
              <View style={styles.rankBubble}><Text style={styles.rankText}>{index + 1}</Text></View>
              <View style={styles.textWrap}>
                <Text style={styles.rowTitle}>{item.username}</Text>
                <Text style={styles.rowMeta}>{roleLabel(item.role)} - Score {item.activityScore}</Text>
                <Text style={styles.rowSub}>Publis {item.proposalsCount} - Collection {item.collectionCount}</Text>
                <Text style={styles.rowSub}>Messages {item.messagesCount} - Notes {item.ratingsCount} - Participations {item.participationsCount}</Text>
              </View>
              <Text style={styles.linkArrow}>{">"}</Text>
            </Pressable>
          ))}
          {!loading && !stats?.activeProfiles?.length ? <Text style={styles.empty}>Aucun profil actif a afficher.</Text> : null}
        </>
      ) : null}

      {currentSection === "publications" ? (
        <>
          {stats?.topRatedPublications?.map((item, index) => (
            <Pressable
              key={item.id}
              style={styles.rowCard}
              onPress={() => router.push({ pathname: "/(user)/glass/[id]", params: { id: String(item.id) } } as any)}
            >
              <View style={styles.rankBubble}><Text style={styles.rankText}>{index + 1}</Text></View>
              <View style={styles.textWrap}>
                <Text style={styles.rowTitle}>{item.name}</Text>
                <Text style={styles.rowMeta}>{item.manufacturerName || "Brasserie inconnue"}</Text>
                <Text style={styles.rowSub}>Ajoute par {item.creatorUsername}</Text>
                <Text style={styles.rowSub}>{item.avgRating}/5 - {item.ratingsCount} note{item.ratingsCount > 1 ? "s" : ""}</Text>
              </View>
              <Text style={styles.linkArrow}>{">"}</Text>
            </Pressable>
          ))}
          {!loading && !stats?.topRatedPublications?.length ? <Text style={styles.empty}>Aucune publication notee pour le moment.</Text> : null}
        </>
      ) : null}

      {currentSection === "events" ? (
        <>
          {stats?.topEvents?.map((item, index) => (
            <Pressable
              key={item.id}
              style={styles.rowCard}
              onPress={() => router.push({ pathname: "/(user)/event/[id]", params: { id: String(item.id) } } as any)}
            >
              <View style={styles.rankBubble}><Text style={styles.rankText}>{index + 1}</Text></View>
              <View style={styles.textWrap}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowMeta}>{item.breweryName || "Badier Beer"}</Text>
                <Text style={styles.rowSub}>{item.participantsCount} participant{item.participantsCount > 1 ? "s" : ""}</Text>
                <Text style={styles.rowSub}>{formatDate(item.startAt)}</Text>
              </View>
              <Text style={styles.linkArrow}>{">"}</Text>
            </Pressable>
          ))}
          {!loading && !stats?.topEvents?.length ? <Text style={styles.empty}>Aucun evenement frequentable pour le moment.</Text> : null}
        </>
      ) : null}
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
  title: { flex: 1, textAlign: "center", color: colors.text, fontSize: typography.h2, fontWeight: "900" },
  loading: { color: colors.muted, textAlign: "center", marginTop: spacing.sm, marginBottom: spacing.sm },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rankBubble: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  rankText: { color: "#2E1A0F", fontWeight: "900" },
  textWrap: { flex: 1 },
  rowTitle: { color: colors.text, fontWeight: "900", fontSize: 16 },
  rowMeta: { color: colors.muted, marginTop: 2, fontWeight: "700" },
  rowSub: { color: colors.text, marginTop: 4 },
  linkArrow: { color: colors.muted, fontSize: 26, fontWeight: "900" },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.sm },
});

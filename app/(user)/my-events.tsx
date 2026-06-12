import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { listMyValidatedEventsApi, PublicBreweryEvent } from "../../src/api/publicContentApi";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";

function formatDateTime(value?: string | null) {
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

export default function MyEventsScreen() {
  const [items, setItems] = useState<PublicBreweryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listMyValidatedEventsApi();
      setItems(res.items || []);
    } catch (e: any) {
      setError(e?.message || "Impossible de charger vos evenements");
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
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={20} color={colors.text as any} />
        </Pressable>
        <Text style={styles.title}>Mes evenements</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.subtitle}>Retrouvez ici les evenements ou votre participation est validee.</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Chargement...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Aucun evenement valide</Text>
          <Text style={styles.muted}>Vos participations validees apparaitront ici.</Text>
        </View>
      ) : (
        items.map((item) => (
          <Pressable key={item.id} style={styles.card} onPress={() => router.push({ pathname: "/(user)/event/[id]", params: { id: String(item.id) } } as any)}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>{item.Manufacturer?.name || "Brasserie"}</Text>
            <Text style={styles.cardMeta}>Debut: {formatDateTime(item.startAt || item.publishedAt)}</Text>
            <Text style={styles.cardMeta}>Adresse: {item.address || "A confirmer"}</Text>
            <Text style={styles.cardStatus}>Participation validee</Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.lg, marginBottom: spacing.lg },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  title: { fontSize: typography.h1, fontWeight: "900", color: colors.text },
  subtitle: { color: colors.muted, marginBottom: spacing.lg, textAlign: "center" },
  center: { alignItems: "center", justifyContent: "center", paddingVertical: spacing.xl, gap: spacing.sm },
  muted: { color: colors.muted, textAlign: "center" },
  error: { color: colors.dangerText, fontWeight: "900", textAlign: "center" },
  emptyCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: spacing.lg },
  emptyTitle: { color: colors.text, fontWeight: "900", fontSize: 17, marginBottom: spacing.xs, textAlign: "center" },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: spacing.lg, marginBottom: spacing.md },
  cardTitle: { color: colors.text, fontWeight: "900", fontSize: 17 },
  cardMeta: { color: colors.muted, marginTop: spacing.xs },
  cardStatus: { color: colors.successText, fontWeight: "900", marginTop: spacing.md },
});

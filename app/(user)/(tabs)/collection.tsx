import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Pressable, TextInput, Image } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCollection } from "../../../src/store/useCollection";
import { listMyProposalsApi } from "../../../src/api/proposalsApi";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";
import type { Glass } from "../../../src/api/glassesApi";
import Button from "../../../src/components/Button";

type FilterMode = "collection" | "validated" | "pending" | "rejected" | "validated_missing";

type DisplayItem = {
  key: string;
  glassId: number;
  id: number;
  glass: Glass | null;
  status: "VALIDE" | "EN_ATTENTE" | "REJETE";
  rejectReason?: string | null;
  inCollection: boolean;
  source: "collection" | "proposal";
};

function statusBadge(status: DisplayItem["status"], inCollection: boolean) {
  if (inCollection) {
    return { bg: colors.successBg, text: colors.successText, label: "Dans ma collection" };
  }
  if (status === "VALIDE") return { bg: colors.successBg, text: colors.successText, label: "Validé" };
  if (status === "REJETE") return { bg: colors.dangerBg, text: colors.dangerText, label: "Rejeté" };
  return { bg: colors.warningBg, text: colors.warningText, label: "En attente" };
}

export default function CollectionScreen() {
  const { items, loading, error, refresh, has, toggle } = useCollection();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<FilterMode>("collection");
  const [proposals, setProposals] = useState<any[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(true);
  const [proposalsError, setProposalsError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  const loadProposals = useCallback(async () => {
    try {
      setProposalsLoading(true);
      setProposalsError(null);
      const res = await listMyProposalsApi();
      setProposals(res.items || []);
    } catch (e: any) {
      setProposalsError(e?.message || "Erreur de chargement des propositions");
    } finally {
      setProposalsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  useFocusEffect(
    useCallback(() => {
      refresh();
      loadProposals();
    }, [refresh, loadProposals])
  );

  const normalizedItems = useMemo<DisplayItem[]>(() => {
    const collectionIds = new Set(items.map((item) => item.glassId));

    const proposalEntries = proposals.map((item) => ({
      key: `proposal-${item.id}`,
      id: Number(item.id),
      glassId: Number(item.id),
      glass: item as Glass,
      status: (item.status || "EN_ATTENTE") as DisplayItem["status"],
      rejectReason: item.rejectReason || null,
      inCollection: collectionIds.has(Number(item.id)),
      source: "proposal" as const,
    }));

    const collectionEntries = items.map((item) => ({
      key: `collection-${item.id}`,
      id: Number(item.id),
      glassId: Number(item.glassId),
      glass: (item.Glass || null) as Glass | null,
      status: ((item.Glass?.status || "VALIDE") as DisplayItem["status"]),
      rejectReason: null,
      inCollection: true,
      source: "collection" as const,
    }));

    const seen = new Set<string>();
    return [...collectionEntries, ...proposalEntries].filter((entry) => {
      const uniqueKey = `glass-${entry.glassId}-${entry.source}`;
      if (seen.has(uniqueKey)) return false;
      seen.add(uniqueKey);
      return true;
    });
  }, [items, proposals]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return normalizedItems.filter((item) => {
      const glass = item.glass;
      const matchesText = !query ||
        (glass?.name || "").toLowerCase().includes(query) ||
        (glass?.Manufacturer?.name || "").toLowerCase().includes(query);

      if (!matchesText) return false;

      if (filter === "collection") return item.inCollection;
      if (filter === "validated") return item.status === "VALIDE";
      if (filter === "pending") return item.status === "EN_ATTENTE";
      if (filter === "rejected") return item.status === "REJETE";
      return item.status === "VALIDE" && !item.inCollection;
    });
  }, [normalizedItems, q, filter]);

  function primaryImageUrl(g?: Glass | null): string | null {
    const list = g?.images || [];
    const primary = list.find((i) => i.isPrimary) || list[0];
    return primary ? primary.url : null;
  }

  function StarsBar({ avg }: { avg: number | null | undefined }) {
    const n = Math.round(Number(avg || 0));
    return (
      <View style={styles.starsWrap}>
        <Text style={styles.starsValue}>{n}</Text>
        <Text style={styles.starsText}>
          {Array.from({ length: 5 }).map((_, i) => (i < n ? "★" : "☆")).join("")}
        </Text>
      </View>
    );
  }

  const isLoading = loading || proposalsLoading;
  const screenError = error || proposalsError;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ma collection</Text>
      <Text style={styles.subtitle}>Retrouvez vos verres ajoutés et vos propositions selon leur statut.</Text>

      <View style={styles.filtersWrap}>
        {[
          ["collection", "Collection"],
          ["validated", "Validées"],
          ["pending", "En attente"],
          ["rejected", "Rejetées"],
          ["validated_missing", "Validées hors collection"],
        ].map(([value, label]) => (
          <Pressable
            key={value}
            onPress={() => setFilter(value as FilterMode)}
            style={[styles.filterChip, filter === value ? styles.filterChipActive : null]}
          >
            <Text style={[styles.filterChipText, filter === value ? styles.filterChipTextActive : null]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={colors.muted as any} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Rechercher…"
          placeholderTextColor={colors.muted}
          style={styles.search}
          autoCapitalize="none"
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.centerText}>Chargement...</Text>
        </View>
      ) : screenError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{screenError}</Text>
          <Text style={styles.retry} onPress={() => { refresh(); loadProposals(); }}>Réessayer</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.list}
          numColumns={2}
          columnWrapperStyle={styles.rowWrap}
          ListEmptyComponent={<Text style={styles.empty}>Aucun verre pour ce filtre.</Text>}
          renderItem={({ item }) => {
            const glass = item.glass;
            const badge = statusBadge(item.status, item.inCollection);
            return (
              <Pressable
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: "/(user)/glass/[id]",
                    params: { id: String(item.glassId) },
                  } as any)
                }
              >
                <View style={styles.cardImage}>
                  {primaryImageUrl(glass) ? (
                    <Image source={{ uri: primaryImageUrl(glass)! }} style={styles.cardImageAsset} resizeMode="cover" />
                  ) : (
                    <Text style={styles.cardImageEmoji}>🍺</Text>
                  )}
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle} numberOfLines={1}>{glass?.name || "Verre"}</Text>
                <Text style={styles.cardSubtitle} numberOfLines={1}>{glass?.Manufacturer?.name || "—"}</Text>
                <View style={styles.cardFooter}>
                  <StarsBar avg={glass?.avgRating} />
                  <Text style={styles.ratingsCount}>({glass?.ratingsCount || 0})</Text>
                </View>
                {item.status === "REJETE" && item.rejectReason ? (
                  <Text style={styles.rejectReason} numberOfLines={2}>Raison: {item.rejectReason}</Text>
                ) : null}
                {item.status === "VALIDE" && !item.inCollection ? (
                  <Button
                    label={savingId === item.glassId ? "..." : "Ajouter à ma collection"}
                    onPress={async () => {
                      try {
                        setSavingId(item.glassId);
                        await toggle(item.glassId);
                        await refresh();
                      } finally {
                        setSavingId(null);
                      }
                    }}
                    disabled={savingId === item.glassId}
                    style={styles.addButton}
                  />
                ) : null}
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing.lg, paddingHorizontal: spacing.lg, backgroundColor: colors.bg },
  title: { fontSize: typography.h1, fontWeight: "800", color: colors.text, marginBottom: spacing.sm, textAlign: "center" },
  subtitle: { color: colors.muted, textAlign: "center", marginBottom: spacing.md, lineHeight: 20 },
  filtersWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, justifyContent: "center", marginBottom: spacing.md },
  filterChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  filterChipText: { color: colors.text, fontWeight: "900", fontSize: 12 },
  filterChipTextActive: { color: "#fff" },
  searchWrap: { flexDirection: "row", alignItems: "center", gap: spacing.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 16, marginBottom: spacing.lg },
  search: { flex: 1, color: colors.text, paddingVertical: 2 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  centerText: { color: colors.muted },
  errorText: { color: colors.dangerText, fontWeight: "800", textAlign: "center" },
  retry: { color: colors.primaryDark, fontWeight: "900" },
  list: { gap: spacing.md, paddingBottom: spacing.xl },
  rowWrap: { gap: spacing.md },
  card: { flex: 1, borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, padding: spacing.sm, shadowColor: colors.shadow as any, shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 8 } },
  cardImage: { height: 140, borderRadius: 14, backgroundColor: colors.bg2, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm, overflow: "hidden" },
  cardImageAsset: { width: "100%", height: "100%" },
  cardImageEmoji: { fontSize: 34, color: colors.muted },
  badge: { position: "absolute", left: spacing.sm, bottom: spacing.sm, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontWeight: "900", fontSize: 10 },
  cardTitle: { fontSize: 15, fontWeight: "900", color: colors.text, marginTop: 2 },
  cardSubtitle: { marginTop: 4, color: colors.muted, fontSize: 12 },
  cardFooter: { marginTop: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  starsWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  starsValue: { color: colors.text, fontWeight: "900" },
  starsText: { fontSize: 14, color: colors.primaryDark },
  ratingsCount: { color: colors.muted, fontSize: 12 },
  rejectReason: { marginTop: spacing.sm, color: colors.dangerText, fontSize: 12, fontWeight: "700" },
  addButton: { marginTop: spacing.sm },
  empty: { marginTop: spacing.lg, textAlign: "center", color: colors.muted },
});

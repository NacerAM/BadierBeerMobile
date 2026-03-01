import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { listMyProposalsApi } from "../../../src/api/proposalsApi";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";

function badge(status?: string) {
  if (status === "VALIDE") return { bg: "#DCFCE7", text: "#166534", label: "Validé" };
  if (status === "REJETE") return { bg: "#FEE2E2", text: "#991B1B", label: "Rejeté" };
  return { bg: "#FEF3C7", text: "#92400E", label: "En attente" };
}

export default function ProposalsScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await listMyProposalsApi();
      setItems(res.items || []);
    } catch (e: any) {
      setError(e?.message || "Erreur chargement");
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes demandes</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Chargement…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <Text style={styles.retry} onPress={load}>
            Réessayer
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => String(it.id)}
          contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}
          ListEmptyComponent={<Text style={styles.muted}>Aucune proposition.</Text>}
          renderItem={({ item }) => {
            const b = badge(item.status);
            return (
              <View style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <View style={[styles.badge, { backgroundColor: b.bg }]}>
                    <Text style={[styles.badgeText, { color: b.text }]}>{b.label}</Text>
                  </View>
                </View>

                <Text style={styles.cardSubtitle}>{item.Manufacturer?.name || "—"}</Text>

                {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}

                {item.status === "REJETE" && item.rejectReason ? (
                  <Text style={styles.reject}>Raison : {item.rejectReason}</Text>
                ) : null}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing.lg, paddingHorizontal: spacing.md, backgroundColor: colors.bg },
  title: { fontSize: typography.h1, fontWeight: "800", color: colors.text, marginBottom: spacing.md },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: spacing.lg },
  muted: { color: colors.muted, textAlign: "center" },
  error: { color: "#991B1B", fontWeight: "700", textAlign: "center" },
  retry: { color: colors.primaryDark, fontWeight: "800" },

  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing.md, backgroundColor: colors.card },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  cardTitle: { fontSize: 16, fontWeight: "800", color: colors.text, flex: 1 },
  cardSubtitle: { marginTop: 6, color: colors.muted },
  desc: { marginTop: 8, color: colors.text },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: "800" },
  reject: { marginTop: 8, color: "#991B1B", fontWeight: "800" },
});

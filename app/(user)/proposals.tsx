import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useProposals } from "../../src/store/useProposals";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";

function statusBadge(status: string) {
  if (status === "VALIDE") return { bg: "#DCFCE7", text: "#166534", label: "Validé" };
  if (status === "REJETE") return { bg: "#FEE2E2", text: "#991B1B", label: "Rejeté" };
  return { bg: "#FEF3C7", text: "#92400E", label: "En attente" };
}

export default function ProposalsStatusScreen() {
  const { proposals } = useProposals();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes demandes</Text>

      <FlatList
        data={proposals}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}
        renderItem={({ item }) => {
          const b = statusBadge(item.status);
          return (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <View style={[styles.badge, { backgroundColor: b.bg }]}>
                  <Text style={[styles.badgeText, { color: b.text }]}>{b.label}</Text>
                </View>
              </View>

              <Text style={styles.cardSubtitle}>{item.brand}</Text>
              <Text style={styles.desc}>{item.description}</Text>

              {item.status === "REJETE" && item.rejectReason ? (
                <Text style={styles.reject}>Raison : {item.rejectReason}</Text>
              ) : null}
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucune proposition pour l’instant.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing.lg, paddingHorizontal: spacing.md, backgroundColor: colors.bg },
  title: { fontSize: typography.h1, fontWeight: "800", color: colors.text, marginBottom: spacing.md },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing.md, backgroundColor: colors.card },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.text, flex: 1 },
  cardSubtitle: { marginTop: 6, color: colors.muted },
  desc: { marginTop: 8, color: colors.text },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: "800" },
  reject: { marginTop: 8, color: "#991B1B", fontWeight: "700" },
  empty: { marginTop: spacing.lg, textAlign: "center", color: colors.muted },
});

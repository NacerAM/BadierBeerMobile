import React, { useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { useCollection } from "../../../src/store/useCollection";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";

export default function CollectionScreen() {
  const { items, loading, error, refresh } = useCollection();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ma collection</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Chargement…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <Text style={styles.retry} onPress={refresh}>
            Réessayer
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => String(it.id)}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          ListEmptyComponent={<Text style={styles.muted}>Collection vide.</Text>}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.rowTitle}>{item.Glass?.name ?? "Verre"}</Text>
              <Text style={styles.rowSub}>{item.Glass?.Manufacturer?.name ?? "—"}</Text>

              <Text
                style={styles.link}
                onPress={() =>
                  router.push({
                    pathname: "/(user)/glass/[id]",
                    params: { id: String(item.glassId) },
                  } as any)
                }
              >
                Voir détail →
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  title: { fontSize: typography.h1, fontWeight: "800", color: colors.text, marginBottom: spacing.md },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  muted: { color: colors.muted, textAlign: "center" },
  error: { color: "#991B1B", fontWeight: "700", textAlign: "center" },
  retry: { color: colors.primaryDark, fontWeight: "800" },

  row: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  rowTitle: { fontSize: 16, fontWeight: "800", color: colors.text },
  rowSub: { marginTop: 4, color: colors.muted },
  link: { marginTop: 10, color: colors.primaryDark, fontWeight: "800" },
});

import React, { useMemo } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { router } from "expo-router";
import Button from "../../src/components/Button";
import { useCollection } from "../../src/store/useCollection";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";

const MOCK_GLASSES = [
  { id: "1", name: "Chimay Trappistes", brand: "Chimay" },
  { id: "2", name: "Duvel Tulip", brand: "Duvel" },
  { id: "3", name: "Leffe Calice", brand: "Leffe" },
  { id: "4", name: "Orval Classic", brand: "Orval" },
];

export default function MyCollectionScreen() {
  const { glassIds, remove } = useCollection();

  const items = useMemo(() => {
    return MOCK_GLASSES.filter((g) => glassIds.includes(g.id));
  }, [glassIds]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ma collection</Text>

      {items.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Votre collection est vide.</Text>
          <Button
            label="Parcourir le catalogue"
            onPress={() => router.push("/(user)/catalogue" as any)}
          />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/(user)/glass/[id]",
                    params: { id: item.id },
                  } as any)
                }
              >
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>{item.brand}</Text>
              </Pressable>

              <View style={{ marginTop: spacing.sm }}>
                <Button
                  label="Retirer"
                  variant="secondary"
                  onPress={() => remove(item.id)}
                />
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: typography.h1,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.md,
  },
  list: { gap: spacing.md, paddingBottom: spacing.xl },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: colors.card,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  cardSubtitle: { marginTop: 6, color: colors.muted },
  emptyBox: { flex: 1, justifyContent: "center", gap: spacing.md },
  emptyText: { textAlign: "center", color: colors.muted, marginBottom: spacing.sm },
});

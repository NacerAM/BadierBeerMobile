import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { router } from "expo-router";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";


const MOCK_GLASSES = [
  { id: "1", name: "Chimay Trappistes", brand: "Chimay" },
  { id: "2", name: "Duvel Tulip", brand: "Duvel" },
  { id: "3", name: "Leffe Calice", brand: "Leffe" },
];

export default function CataloguePublicScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Catalogue public</Text>

      <FlatList
        data={MOCK_GLASSES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
  style={styles.card}
  onPress={() =>
    router.push({
      pathname: "/(tabs)/glass/[id]",
      params: { id: item.id },
    })
  }
>

            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{item.brand}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing.lg, paddingHorizontal: spacing.md, backgroundColor: colors.bg },
  title: { fontSize: typography.h1, fontWeight: "600", marginBottom: spacing.md, color: colors.text },
  list: { gap: spacing.md, paddingBottom: spacing.lg },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    backgroundColor: colors.card,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: colors.text },
  cardSubtitle: { marginTop: 4, color: colors.muted },
});

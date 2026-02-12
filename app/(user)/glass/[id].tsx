import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Button from "../../../src/components/Button";
import { useCollection } from "../../../src/store/useCollection";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";

const MOCK_GLASSES = [
  { id: "1", name: "Chimay Trappistes", brand: "Chimay", description: "Verre officiel Chimay." },
  { id: "2", name: "Duvel Tulip", brand: "Duvel", description: "Verre tulipe Duvel." },
  { id: "3", name: "Leffe Calice", brand: "Leffe", description: "Calice traditionnel Leffe." },
  { id: "4", name: "Orval Classic", brand: "Orval", description: "Verre emblématique Orval." },
];

export default function GlassDetailUserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { add, has } = useCollection();

  const glass = MOCK_GLASSES.find((g) => g.id === id);

  if (!glass) {
    return (
      <View style={styles.container}>
        <Text>Verre introuvable</Text>
      </View>
    );
  }

  const already = has(glass.id);

  return (
    <View style={styles.container}>
      <View style={styles.imagePlaceholder}>
        <Text style={{ color: colors.muted }}>Image du verre</Text>
      </View>

      <Text style={styles.title}>{glass.name}</Text>
      <Text style={styles.brand}>{glass.brand}</Text>
      <Text style={styles.description}>{glass.description}</Text>

      <View style={styles.actions}>
        <Button
          label={already ? "Déjà dans ma collection" : "Ajouter à ma collection"}
          onPress={() => add(glass.id)}
          disabled={already}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.bg },
  imagePlaceholder: {
    height: 200,
    backgroundColor: colors.card,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { fontSize: typography.h1, fontWeight: "800", color: colors.text },
  brand: { marginTop: 4, color: colors.muted },
  description: { marginTop: spacing.md, fontSize: typography.body, color: colors.text },
  actions: { marginTop: spacing.xl },
});

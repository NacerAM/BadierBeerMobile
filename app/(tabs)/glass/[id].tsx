import { View, Text, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";

const MOCK_GLASSES = [
  { id: "1", name: "Chimay Trappistes", brand: "Chimay", description: "Verre officiel Chimay." },
  { id: "2", name: "Duvel Tulip", brand: "Duvel", description: "Verre tulipe Duvel." },
  { id: "3", name: "Leffe Calice", brand: "Leffe", description: "Calice traditionnel Leffe." },
];

export default function GlassDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const glass = MOCK_GLASSES.find((g) => g.id === id);

  if (!glass) {
    return (
      <View style={styles.container}>
        <Text>Verre introuvable</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.imagePlaceholder}>
        <Text style={{ color: "#888" }}>Image du verre</Text>
      </View>

      <Text style={styles.title}>{glass.name}</Text>
      <Text style={styles.brand}>{glass.brand}</Text>
      <Text style={styles.description}>{glass.description}</Text>

      <View style={styles.lockBox}>
        <Text style={styles.lockText}>
          🔒 Connectez-vous pour ajouter à votre collection
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.buttonText}>Se connecter</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: "#eee",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
  },
  brand: {
    marginTop: 4,
    color: "#666",
  },
  description: {
    marginTop: 12,
    fontSize: 14,
  },
  lockBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
  },
  lockText: {
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#222",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});

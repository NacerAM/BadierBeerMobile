import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { router } from "expo-router";

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
  container: { flex: 1, paddingTop: 24, paddingHorizontal: 16 },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 12 },
  list: { gap: 12, paddingBottom: 24 },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
  },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  cardSubtitle: { marginTop: 4, color: "#666" },
});

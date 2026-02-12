import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { useMessages } from "../../src/store/useMessages";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";

export default function MessagesScreen() {
  const { conversations } = useMessages();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messagerie</Text>

      {conversations.map((c) => (
        <Pressable
          key={c.id}
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: "/(user)/chat/[id]",
              params: { id: c.id },
            } as any)
          }
        >
          <Text style={styles.cardTitle}>{c.title}</Text>
          <Text style={styles.cardSubtitle}>Appuyez pour ouvrir la conversation</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing.lg, paddingHorizontal: spacing.md, backgroundColor: colors.bg },
  title: { fontSize: typography.h1, fontWeight: "800", color: colors.text, marginBottom: spacing.md },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing.md, backgroundColor: colors.card },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  cardSubtitle: { marginTop: 6, color: colors.muted },
});

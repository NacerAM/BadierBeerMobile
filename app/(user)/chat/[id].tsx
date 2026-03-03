import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Button from "../../../src/components/Button";
import { useMessages } from "../../../src/store/useMessages";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getConversation, getMessages, sendMessage } = useMessages();

  const conv = getConversation(id);
  const msgs = useMemo(() => getMessages(id), [id, getMessages]);

  const [text, setText] = useState("");

  function onSend() {
    const t = text.trim();
    if (!t) return;
    sendMessage(id, t);
    setText("");
  }

  if (!conv) {
    return (
      <View style={styles.container}>
        <Text>Conversation introuvable</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <Text style={styles.title}>{conv.title}</Text>

      <FlatList
        data={[...msgs].reverse()}
        inverted
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ paddingVertical: spacing.md, gap: spacing.sm }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.from === "user" ? styles.bubbleUser : styles.bubbleAdmin,
            ]}
          >
            <Text style={styles.bubbleText}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Votre message…"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <View style={{ width: 120 }}>
          <Button label="Envoyer" onPress={onSend} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing.lg, paddingHorizontal: spacing.md, backgroundColor: colors.bg },
  title: { fontSize: typography.h2, fontWeight: "800", color: colors.text, marginBottom: spacing.sm },

  bubble: {
    maxWidth: "85%",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleUser: { alignSelf: "flex-end", backgroundColor: colors.primarySoft },
  bubbleAdmin: { alignSelf: "flex-start", backgroundColor: colors.card },
  bubbleText: { color: colors.text },

  inputRow: { flexDirection: "row", gap: spacing.sm, paddingBottom: spacing.lg, alignItems: "center" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    color: colors.text,
  },
});


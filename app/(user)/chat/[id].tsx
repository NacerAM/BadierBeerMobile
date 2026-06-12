import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, KeyboardAvoidingView, Platform, Pressable, Alert } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Button from "../../../src/components/Button";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";
import { getMessageConversationApi, listConversationMessagesApi, MessageConversation, MessageItem, sendConversationMessageApi } from "../../../src/api/messagesApi";
import { useAuth } from "../../../src/store/useAuth";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = Number(id);
  const { user } = useAuth();
  const [conversation, setConversation] = useState<MessageConversation | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [conversationRes, messagesRes] = await Promise.all([
        getMessageConversationApi(conversationId),
        listConversationMessagesApi(conversationId),
      ]);
      setConversation(conversationRes);
      setMessages(messagesRes.items ?? []);
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de charger la conversation");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function onSend() {
    const body = text.trim();
    if (!body) return;

    try {
      setSending(true);
      const item = await sendConversationMessageApi(conversationId, body);
      setMessages((current) => [...current, item]);
      setText("");
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible d'envoyer le message");
    } finally {
      setSending(false);
    }
  }

  if (loading || !conversation) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Chargement...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={20} color={colors.text as any} />
        </Pressable>
        <View style={styles.headerBody}>
          <Text style={styles.title}>{conversation.counterpart?.username || "Conversation"}</Text>
          <Text style={styles.subtitle}>{conversation.topicLabel}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={[...messages].reverse()}
        inverted
        keyExtractor={(m) => String(m.id)}
        contentContainerStyle={{ paddingVertical: spacing.md, gap: spacing.sm }}
        renderItem={({ item }) => {
          const isMine = item.sender?.id === user?.id;
          return (
            <View style={[styles.bubble, isMine ? styles.bubbleUser : styles.bubbleOther]}>
              {!isMine ? <Text style={styles.senderName}>{item.sender?.username || "Contact"}</Text> : null}
              <Text style={styles.bubbleText}>{item.body}</Text>
            </View>
          );
        }}
      />

      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Votre message..."
          placeholderTextColor={colors.muted}
          style={styles.input}
          multiline
        />
        <View style={{ width: 120 }}>
          <Button label={sending ? "..." : "Envoyer"} onPress={onSend} disabled={sending} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing.lg, paddingHorizontal: spacing.md, backgroundColor: colors.bg },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.sm },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", shadowColor: colors.shadow as any, shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  headerBody: { flex: 1, alignItems: "center" },
  title: { fontSize: typography.h2, fontWeight: "800", color: colors.text },
  subtitle: { color: colors.muted, marginTop: 2, fontSize: 12 },
  bubble: {
    maxWidth: "85%",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleUser: { alignSelf: "flex-end", backgroundColor: colors.primarySoft },
  bubbleOther: { alignSelf: "flex-start", backgroundColor: colors.card },
  senderName: { color: colors.primaryDark, fontWeight: "900", marginBottom: 4, fontSize: 12 },
  bubbleText: { color: colors.text },
  inputRow: { flexDirection: "row", gap: spacing.sm, paddingBottom: spacing.lg, alignItems: "flex-end" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    color: colors.text,
    minHeight: 48,
    maxHeight: 120,
  },
});

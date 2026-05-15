import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Image, ScrollView, Alert } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";
import Button from "../../../src/components/Button";
import { listMessageConversationsApi, MessageConversation, openMessageConversationApi } from "../../../src/api/messagesApi";
import { useAuth } from "../../../src/store/useAuth";

function formatDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("fr-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessagesScreen() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [items, setItems] = useState<MessageConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingAdmin, setOpeningAdmin] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await listMessageConversationsApi();
      setItems(res.items ?? []);
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de charger la messagerie");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function openAdminSupport() {
    try {
      setOpeningAdmin(true);
      const conversation = await openMessageConversationApi({ targetType: "ADMIN_SUPPORT" });
      router.push({ pathname: "/(user)/chat/[id]", params: { id: String(conversation.id) } } as any);
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de contacter l'administrateur");
    } finally {
      setOpeningAdmin(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Messagerie</Text>
      <Text style={styles.subtitle}>
        {isAdmin
          ? "Consultez les messages recus des utilisateurs et des brasseurs, puis repondez directement dans chaque conversation."
          : "Contactez un brasseur pour un produit ou un evenement, ou l'administrateur pour un verre, un evenement ou toute autre demande."}
      </Text>

      {!isAdmin ? (
        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>Support administrateur</Text>
          <Text style={styles.supportText}>Besoin d'aide generale ou d'un suivi sur un verre ou un evenement ?</Text>
          <Button label={openingAdmin ? "Ouverture..." : "Contacter l'admin"} onPress={openAdminSupport} disabled={openingAdmin} style={styles.supportButton} />
        </View>
      ) : null}

      {loading ? <Text style={styles.empty}>Chargement...</Text> : null}
      {!loading && items.length === 0 ? <Text style={styles.empty}>Aucune conversation pour le moment.</Text> : null}

      {!loading ? items.map((c) => (
        <Pressable
          key={c.id}
          style={styles.card}
          onPress={() => router.push({ pathname: "/(user)/chat/[id]", params: { id: String(c.id) } } as any)}
        >
          <View style={styles.avatarWrap}>
            {c.counterpart?.avatarUrl ? <Image source={{ uri: c.counterpart.avatarUrl }} style={styles.avatar} /> : <View style={styles.avatarFallback}><Text style={styles.avatarEmoji}>💬</Text></View>}
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{c.counterpart?.username || "Conversation"}</Text>
            <Text style={styles.cardTopic}>{c.topicLabel}</Text>
            <Text style={styles.cardPreview} numberOfLines={2}>{c.lastMessagePreview || "Appuyez pour ouvrir la conversation"}</Text>
          </View>
          <Text style={styles.cardDate}>{formatDateTime(c.lastMessageAt || c.createdAt)}</Text>
        </Pressable>
      )) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontSize: typography.h1, fontWeight: "900", color: colors.text, marginBottom: spacing.sm },
  subtitle: { color: colors.muted, lineHeight: 20, marginBottom: spacing.lg },
  supportCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: spacing.lg, marginBottom: spacing.lg },
  supportTitle: { color: colors.text, fontWeight: "900", fontSize: 17 },
  supportText: { color: colors.muted, marginTop: spacing.xs, lineHeight: 20 },
  supportButton: { marginTop: spacing.md },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: spacing.md, marginBottom: spacing.md, flexDirection: "row", gap: spacing.md, alignItems: "center" },
  avatarWrap: { width: 52 },
  avatar: { width: 52, height: 52, borderRadius: 16, backgroundColor: colors.bg2 },
  avatarFallback: { width: 52, height: 52, borderRadius: 16, backgroundColor: colors.bg2, alignItems: "center", justifyContent: "center" },
  avatarEmoji: { fontSize: 22 },
  cardBody: { flex: 1 },
  cardTitle: { color: colors.text, fontWeight: "900", fontSize: 16 },
  cardTopic: { color: colors.primaryDark, fontWeight: "800", marginTop: 2 },
  cardPreview: { color: colors.muted, marginTop: spacing.xs, lineHeight: 18 },
  cardDate: { color: colors.muted, fontSize: 11, alignSelf: "flex-start" },
  empty: { textAlign: "center", color: colors.muted, marginTop: spacing.lg },
});

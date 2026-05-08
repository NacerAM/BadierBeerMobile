import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect, usePathname } from "expo-router";
import Button from "../../src/components/Button";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";
import {
  AppNotification,
  listNotificationsApi,
  markAllNotificationsReadApi,
  markNotificationReadApi,
} from "../../src/api/notificationsApi";

function formatDateTime(value?: string) {
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

function notificationColor(type: AppNotification["type"]) {
  if (type === "GLASS_VALIDATED") return colors.successText;
  if (type === "GLASS_RATED") return colors.primaryDark;
  return colors.warningText;
}

export default function NotificationsScreen() {
  const pathname = usePathname();
  const showBack = !pathname?.includes("/(user)/(tabs)/notifications");
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listNotificationsApi();
      setItems(res.items ?? []);
      setUnreadCount(res.unreadCount ?? 0);
    } catch (e: any) {
      setError(e?.message || "Impossible de charger les notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function openNotification(item: AppNotification) {
    try {
      if (!item.readAt) {
        await markNotificationReadApi(item.id);
        setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, readAt: new Date().toISOString() } : entry));
        setUnreadCount((current) => Math.max(0, current - 1));
      }
    } catch {}

    if (item.type === "GLASS_VALIDATED" || item.type === "GLASS_RATED") {
      if (item.payload?.glassId) {
        router.push({ pathname: "/(user)/glass/[id]", params: { id: String(item.payload.glassId) } } as any);
      }
      return;
    }

    if (item.type === "EVENT_UPCOMING" && item.payload?.eventId) {
      router.push({ pathname: "/(user)/event/[id]", params: { id: String(item.payload.eventId) } } as any);
    }
  }

  async function openProfileFromNotification(item: AppNotification) {
    if (!item.payload?.fromUserId) return;
    router.push({ pathname: "/(user)/profile/[id]", params: { id: String(item.payload.fromUserId) } } as any);
  }

  async function markAllRead() {
    try {
      setMarkingAll(true);
      await markAllNotificationsReadApi();
      setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
      setUnreadCount(0);
    } catch (e: any) {
      setError(e?.message || "Impossible de marquer les notifications");
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        {showBack ? <Pressable onPress={() => router.back()} hitSlop={10}><Text style={styles.back}>‹</Text></Pressable> : <View style={{ width: 30 }} />}
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Centre de notifications</Text>
        <Text style={styles.summaryText}>{unreadCount} notification{unreadCount > 1 ? "s" : ""} non lue{unreadCount > 1 ? "s" : ""}</Text>
        <Button label={markingAll ? "Mise a jour..." : "Tout marquer comme lu"} onPress={markAllRead} disabled={markingAll || unreadCount === 0} variant="secondary" style={styles.summaryButton} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator /><Text style={styles.muted}>Chargement...</Text></View>
      ) : error ? (
        <View style={styles.center}><Text style={styles.error}>{error}</Text></View>
      ) : items.length === 0 ? (
        <View style={styles.emptyCard}><Text style={styles.emptyTitle}>Aucune notification</Text><Text style={styles.muted}>Les validations de verres, les nouvelles notes et les evenements a venir apparaitront ici.</Text></View>
      ) : (
        items.map((item) => (
          <Pressable key={item.id} style={[styles.card, !item.readAt ? styles.cardUnread : null]} onPress={() => openNotification(item)}>
            <View style={styles.cardTop}>
              <Text style={[styles.cardType, { color: notificationColor(item.type) }]}>{item.title}</Text>
              {!item.readAt ? <View style={styles.dot} /> : null}
            </View>
            <Text style={styles.cardMessage}>{item.message}</Text>
            <Text style={styles.cardDate}>{formatDateTime(item.createdAt)}</Text>
            {item.type === "GLASS_RATED" && item.payload?.fromUserId ? (
              <Pressable onPress={() => openProfileFromNotification(item)} hitSlop={10}>
                <Text style={styles.profileLink}>Voir le profil de l'utilisateur</Text>
              </Pressable>
            ) : null}
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.lg, marginTop: spacing.lg },
  back: { fontSize: 26, fontWeight: "900", color: colors.text, marginTop: -2 },
  title: { fontSize: typography.h1, fontWeight: "900", color: colors.text },
  summaryCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: spacing.lg, marginBottom: spacing.lg },
  summaryTitle: { color: colors.text, fontWeight: "900", fontSize: 18 },
  summaryText: { color: colors.muted, marginTop: spacing.xs },
  summaryButton: { marginTop: spacing.md },
  center: { alignItems: "center", justifyContent: "center", paddingVertical: spacing.xl, gap: spacing.sm },
  muted: { color: colors.muted, textAlign: "center" },
  error: { color: colors.dangerText, fontWeight: "900", textAlign: "center" },
  emptyCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: spacing.lg },
  emptyTitle: { color: colors.text, fontWeight: "900", fontSize: 17, marginBottom: spacing.xs },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: spacing.lg, marginBottom: spacing.md },
  cardUnread: { borderColor: colors.primaryDark, shadowColor: colors.shadow as any, shadowOpacity: 0.16, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  cardType: { fontWeight: "900", fontSize: 16, flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 999, backgroundColor: colors.primaryDark },
  cardMessage: { color: colors.text, marginTop: spacing.sm, lineHeight: 20 },
  cardDate: { color: colors.muted, marginTop: spacing.sm, fontSize: 12 },
  profileLink: { color: colors.primaryDark, fontWeight: "900", marginTop: spacing.sm },
});

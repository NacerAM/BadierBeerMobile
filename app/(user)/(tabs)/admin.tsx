import React, { useCallback, useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import Button from "../../../src/components/Button";
import Input from "../../../src/components/Input";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";
import {
  AdminAccount,
  AdminPendingEvent,
  AdminPendingGlass,
  listAdminAccountsApi,
  listPendingAdminGlassesApi,
  listPendingAdminPostsApi,
  reviewAdminAccountApi,
  reviewAdminGlassApi,
  reviewAdminPostApi,
} from "../../../src/api/adminApi";

type AdminTab = "accounts" | "glasses" | "events";

function formatDateTime(value?: string | null) {
  if (!value) return "A confirmer";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("fr-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function accountStatusLabel(status: AdminAccount["status"]) {
  if (status === "ACTIVE") return "Actif";
  if (status === "SUSPENDED") return "Suspendu";
  if (status === "PENDING_APPROVAL") return "Attente admin";
  return "Email non verifie";
}

export default function AdminScreen() {
  const [tab, setTab] = useState<AdminTab>("accounts");
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [glasses, setGlasses] = useState<AdminPendingGlass[]>([]);
  const [events, setEvents] = useState<AdminPendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [accountReasons, setAccountReasons] = useState<Record<number, string>>({});
  const [glassReasons, setGlassReasons] = useState<Record<number, string>>({});
  const [eventReasons, setEventReasons] = useState<Record<number, string>>({});

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [accountsRes, glassesRes, eventsRes] = await Promise.all([
        listAdminAccountsApi(),
        listPendingAdminGlassesApi(),
        listPendingAdminPostsApi(),
      ]);
      setAccounts(accountsRes.items ?? []);
      setGlasses(glassesRes.items ?? []);
      setEvents(eventsRes.items ?? []);
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de charger l'espace administrateur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function onReviewAccount(item: AdminAccount, action: "validate" | "suspend") {
    const reason = (accountReasons[item.id] || "").trim();
    if (action === "suspend" && reason.length < 3) {
      return Alert.alert("Erreur", "Motif de suspension requis");
    }

    try {
      setBusyKey(`account-${item.id}-${action}`);
      await reviewAdminAccountApi(item.id, { action, reason: action === "suspend" ? reason : undefined });
      await load();
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de mettre a jour ce compte");
    } finally {
      setBusyKey(null);
    }
  }

  async function onReviewGlass(item: AdminPendingGlass, action: "validate" | "reject") {
    const reason = (glassReasons[item.id] || "").trim();
    if (action === "reject" && reason.length < 3) {
      return Alert.alert("Erreur", "Motif de rejet requis");
    }

    try {
      setBusyKey(`glass-${item.id}-${action}`);
      await reviewAdminGlassApi(item.id, { action, rejectReason: action === "reject" ? reason : undefined });
      await load();
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de traiter ce verre");
    } finally {
      setBusyKey(null);
    }
  }

  async function onReviewEvent(item: AdminPendingEvent, action: "validate" | "reject") {
    const reason = (eventReasons[item.id] || "").trim();
    if (action === "reject" && reason.length < 3) {
      return Alert.alert("Erreur", "Motif de rejet requis");
    }

    try {
      setBusyKey(`event-${item.id}-${action}`);
      await reviewAdminPostApi(item.id, { action, rejectReason: action === "reject" ? reason : undefined });
      await load();
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de traiter cet evenement");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={styles.back}>‹</Text></Pressable>
        <Text style={styles.title}>Espace administrateur</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.segmentWrap}>
        <Pressable onPress={() => setTab("accounts")} style={[styles.segment, tab === "accounts" ? styles.segmentActive : null]}><Text style={[styles.segmentText, tab === "accounts" ? styles.segmentTextActive : null]}>Comptes</Text></Pressable>
        <Pressable onPress={() => setTab("glasses")} style={[styles.segment, tab === "glasses" ? styles.segmentActive : null]}><Text style={[styles.segmentText, tab === "glasses" ? styles.segmentTextActive : null]}>Verres</Text></Pressable>
        <Pressable onPress={() => setTab("events")} style={[styles.segment, tab === "events" ? styles.segmentActive : null]}><Text style={[styles.segmentText, tab === "events" ? styles.segmentTextActive : null]}>Evenements</Text></Pressable>
      </View>

      {loading ? <Text style={styles.loading}>Chargement...</Text> : null}

      {!loading && tab === "accounts" ? (
        <View>
          {accounts.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{item.username}</Text>
                <Text style={styles.badge}>{accountStatusLabel(item.status)}</Text>
              </View>
              <Text style={styles.meta}>{item.email} · {item.role === "BREWER" ? "Brasseur" : "Utilisateur"}</Text>
              <Text style={styles.meta}>Creation: {formatDateTime(item.createdAt)}</Text>
              {item.brewery ? <Text style={styles.meta}>Brasserie: {item.brewery.name}{item.brewery.vatNumber ? ` · TVA ${item.brewery.vatNumber}` : ""}</Text> : null}
              {item.statusReason ? <Text style={styles.reject}>Motif: {item.statusReason}</Text> : null}
              <Input label="Motif de suspension" value={accountReasons[item.id] || ""} onChangeText={(value) => setAccountReasons((current) => ({ ...current, [item.id]: value }))} />
              <View style={styles.actionsRow}>
                <Button label={busyKey === `account-${item.id}-validate` ? "..." : "Valider"} onPress={() => onReviewAccount(item, "validate")} disabled={busyKey != null} />
                <Button label={busyKey === `account-${item.id}-suspend` ? "..." : "Suspendre"} variant="secondary" onPress={() => onReviewAccount(item, "suspend")} disabled={busyKey != null} />
              </View>
            </View>
          ))}
          {accounts.length === 0 ? <Text style={styles.empty}>Aucun compte a moderer.</Text> : null}
        </View>
      ) : null}

      {!loading && tab === "glasses" ? (
        <View>
          {glasses.map((item) => {
            const imageUrl = item.images?.find((img) => img.isPrimary)?.url || item.images?.[0]?.url;
            return (
              <View key={item.id} style={styles.card}>
                {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" /> : null}
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.meta}>{item.Manufacturer?.name || "Brasserie inconnue"}</Text>
                <Text style={styles.meta}>Propose par {item.createdBy?.username || "Utilisateur"}</Text>
                {item.description ? <Text style={styles.text}>{item.description}</Text> : null}
                <Input label="Motif de rejet" value={glassReasons[item.id] || ""} onChangeText={(value) => setGlassReasons((current) => ({ ...current, [item.id]: value }))} />
                <View style={styles.actionsRow}>
                  <Button label={busyKey === `glass-${item.id}-validate` ? "..." : "Valider"} onPress={() => onReviewGlass(item, "validate")} disabled={busyKey != null} />
                  <Button label={busyKey === `glass-${item.id}-reject` ? "..." : "Rejeter"} variant="secondary" onPress={() => onReviewGlass(item, "reject")} disabled={busyKey != null} />
                </View>
              </View>
            );
          })}
          {glasses.length === 0 ? <Text style={styles.empty}>Aucun verre en attente.</Text> : null}
        </View>
      ) : null}

      {!loading && tab === "events" ? (
        <View>
          {events.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.meta}>{item.Manufacturer?.name || "Brasserie"}</Text>
              <Text style={styles.meta}>Debut: {formatDateTime(item.startAt)}</Text>
              <Text style={styles.meta}>Fin: {formatDateTime(item.endAt)}</Text>
              <Text style={styles.meta}>Adresse: {item.address || "A confirmer"}</Text>
              <Text style={styles.text}>{item.content}</Text>
              <Input label="Motif de rejet" value={eventReasons[item.id] || ""} onChangeText={(value) => setEventReasons((current) => ({ ...current, [item.id]: value }))} />
              <View style={styles.actionsRow}>
                <Button label={busyKey === `event-${item.id}-validate` ? "..." : "Valider"} onPress={() => onReviewEvent(item, "validate")} disabled={busyKey != null} />
                <Button label={busyKey === `event-${item.id}-reject` ? "..." : "Rejeter"} variant="secondary" onPress={() => onReviewEvent(item, "reject")} disabled={busyKey != null} />
              </View>
            </View>
          ))}
          {events.length === 0 ? <Text style={styles.empty}>Aucun evenement en attente.</Text> : null}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.lg, marginTop: spacing.lg },
  back: { fontSize: 26, fontWeight: "900", color: colors.text, marginTop: -2 },
  title: { fontSize: typography.h1, fontWeight: "900", color: colors.text },
  segmentWrap: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  segment: { flex: 1, borderRadius: 14, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: "center" },
  segmentActive: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  segmentText: { color: colors.text, fontWeight: "900" },
  segmentTextActive: { color: "#2E1A0F" },
  loading: { color: colors.muted, textAlign: "center", marginTop: spacing.lg },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: spacing.lg, marginBottom: spacing.md },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  cardTitle: { color: colors.text, fontWeight: "900", fontSize: 17, flex: 1 },
  badge: { color: colors.primaryDark, fontWeight: "900" },
  meta: { color: colors.muted, marginTop: spacing.xs, fontWeight: "700" },
  text: { color: colors.text, marginTop: spacing.sm, lineHeight: 20 },
  reject: { color: colors.dangerText, marginTop: spacing.sm, fontWeight: "700" },
  image: { width: "100%", height: 180, borderRadius: 14, marginBottom: spacing.md, backgroundColor: colors.bg2 },
  actionsRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.lg },
});

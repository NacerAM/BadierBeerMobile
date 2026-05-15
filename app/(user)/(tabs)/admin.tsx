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
  createAdminPostApi,
  listAdminAccountsApi,
  listPendingAdminGlassesApi,
  listPendingAdminPostsApi,
  reviewAdminAccountApi,
  reviewAdminGlassApi,
  reviewAdminPostApi,
} from "../../../src/api/adminApi";

type AdminTab = "accounts" | "glasses" | "events";

type AdminEventForm = {
  title: string;
  content: string;
  address: string;
  startAt: string;
  endAt: string;
  registrationDeadline: string;
  imageUrl: string;
};

const initialEventForm: AdminEventForm = {
  title: "",
  content: "",
  address: "",
  startAt: "",
  endAt: "",
  registrationDeadline: "",
  imageUrl: "",
};

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
  const [eventForm, setEventForm] = useState<AdminEventForm>(initialEventForm);

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

  useEffect(() => {
    load();
  }, [load]);
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function updateEventForm(key: keyof AdminEventForm, value: string) {
    setEventForm((current) => ({ ...current, [key]: value }));
  }

  async function onCreateAdminEvent() {
    const payload = {
      title: eventForm.title.trim(),
      content: eventForm.content.trim(),
      address: eventForm.address.trim(),
      startAt: eventForm.startAt.trim(),
      endAt: eventForm.endAt.trim(),
      registrationDeadline: eventForm.registrationDeadline.trim(),
      imageUrl: eventForm.imageUrl.trim() || undefined,
    };

    if (!payload.title || !payload.content || !payload.address || !payload.startAt || !payload.endAt || !payload.registrationDeadline) {
      return Alert.alert("Erreur", "Tous les champs obligatoires de l'evenement admin doivent etre renseignes");
    }

    try {
      setBusyKey("create-admin-event");
      await createAdminPostApi(payload);
      setEventForm(initialEventForm);
      Alert.alert("Publie", "L'evenement admin est maintenant visible pour tout le monde");
      await load();
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de publier cet evenement");
    } finally {
      setBusyKey(null);
    }
  }

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
        <View style={{ width: 30 }} />
        <Text style={styles.title}>Espace administrateur</Text>
        <Pressable onPress={() => router.replace("/(user)/(tabs)" as any)} hitSlop={10}>
          <Text style={styles.switchLink}>Voir en tant qu'utilisateur</Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>Validez les comptes, moderez les verres et evenements, publiez vos evenements admin, puis gerez les echanges dans la meme messagerie que les autres comptes.</Text>

      <View style={styles.utilityCard}>
        <Text style={styles.utilityTitle}>Messagerie</Text>
        <Text style={styles.utilityText}>Chaque compte est maintenant consultable. Ouvrez son profil pour le contacter.</Text>
        <Button label="Ouvrir la messagerie" onPress={() => router.push("/(user)/(tabs)/messages" as any)} style={styles.fullButton} />
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
            <Pressable
              key={item.id}
              style={styles.card}
              onPress={() => router.push({ pathname: "/(user)/profile/[id]", params: { id: String(item.id), fromAdmin: "1" } } as any)}
            >
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{item.username}</Text>
                <Text style={styles.badge}>{accountStatusLabel(item.status)}</Text>
              </View>
              <Text style={styles.meta}>{item.email} · {item.role === "BREWER" ? "Brasseur" : "Utilisateur"}</Text>
              <Text style={styles.meta}>Creation: {formatDateTime(item.createdAt)}</Text>
              {item.brewery ? <Text style={styles.meta}>Brasserie: {item.brewery.name}{item.brewery.vatNumber ? ` · TVA ${item.brewery.vatNumber}` : ""}</Text> : null}
              {item.statusReason ? <Text style={styles.reject}>Motif: {item.statusReason}</Text> : null}
              <Text style={styles.openHint}>Touchez pour consulter ce compte et le contacter</Text>
              <Input label="Motif de suspension" value={accountReasons[item.id] || ""} onChangeText={(value) => setAccountReasons((current) => ({ ...current, [item.id]: value }))} />
              <View style={styles.actionsRow}>
                <Button label={busyKey === `account-${item.id}-validate` ? "..." : "Valider"} onPress={() => onReviewAccount(item, "validate")} disabled={busyKey != null} />
                <Button label={busyKey === `account-${item.id}-suspend` ? "..." : "Suspendre"} variant="secondary" onPress={() => onReviewAccount(item, "suspend")} disabled={busyKey != null} />
              </View>
            </Pressable>
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
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Publier un evenement admin</Text>
            <Text style={styles.helper}>Format de date recommande: 2026-05-20T18:00:00.000Z</Text>
            <Input label="Titre" value={eventForm.title} onChangeText={(value) => updateEventForm("title", value)} />
            <Input label="Description" value={eventForm.content} onChangeText={(value) => updateEventForm("content", value)} multiline style={styles.multilineInput} />
            <Input label="Adresse" value={eventForm.address} onChangeText={(value) => updateEventForm("address", value)} />
            <Input label="Date de debut" value={eventForm.startAt} onChangeText={(value) => updateEventForm("startAt", value)} autoCapitalize="none" />
            <Input label="Date de fin" value={eventForm.endAt} onChangeText={(value) => updateEventForm("endAt", value)} autoCapitalize="none" />
            <Input label="Date limite d'inscription" value={eventForm.registrationDeadline} onChangeText={(value) => updateEventForm("registrationDeadline", value)} autoCapitalize="none" />
            <Input label="Image URL optionnelle" value={eventForm.imageUrl} onChangeText={(value) => updateEventForm("imageUrl", value)} autoCapitalize="none" />
            <Button label={busyKey === "create-admin-event" ? "Publication..." : "Publier l'evenement"} onPress={onCreateAdminEvent} disabled={busyKey != null} style={styles.fullButton} />
          </View>

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
          {events.length === 0 ? <Text style={styles.empty}>Aucun evenement en attente. Les evenements admin publies sont immediatement visibles dans l'application.</Text> : null}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.sm, marginTop: spacing.lg, gap: spacing.sm },
  title: { fontSize: typography.h1, fontWeight: "900", color: colors.text, flex: 1, textAlign: "center" },
  switchLink: { color: colors.primaryDark, fontWeight: "900", fontSize: 12, textAlign: "right", maxWidth: 110 },
  subtitle: { color: colors.muted, lineHeight: 20, marginBottom: spacing.lg },
  utilityCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: spacing.lg, marginBottom: spacing.lg },
  utilityTitle: { color: colors.text, fontWeight: "900", fontSize: 17 },
  utilityText: { color: colors.muted, marginTop: spacing.xs, lineHeight: 20 },
  segmentWrap: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg, flexWrap: "wrap" },
  segment: { minWidth: "31%", borderRadius: 14, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: "center" },
  segmentActive: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  segmentText: { color: colors.text, fontWeight: "900" },
  segmentTextActive: { color: "#2E1A0F" },
  loading: { color: colors.muted, textAlign: "center", marginTop: spacing.lg },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: spacing.lg, marginBottom: spacing.md },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  cardTitle: { color: colors.text, fontWeight: "900", fontSize: 17, flex: 1 },
  badge: { color: colors.primaryDark, fontWeight: "900" },
  meta: { color: colors.muted, marginTop: spacing.xs, fontWeight: "700" },
  openHint: { color: colors.primaryDark, marginTop: spacing.md, fontWeight: "900" },
  text: { color: colors.text, marginTop: spacing.sm, lineHeight: 20 },
  helper: { color: colors.muted, marginTop: spacing.xs, marginBottom: spacing.md, lineHeight: 18 },
  multilineInput: { minHeight: 110, textAlignVertical: "top" },
  fullButton: { marginTop: spacing.sm },
  reject: { color: colors.dangerText, marginTop: spacing.sm, fontWeight: "700" },
  image: { width: "100%", height: 180, borderRadius: 14, marginBottom: spacing.md, backgroundColor: colors.bg2 },
  actionsRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm, flexWrap: "wrap" },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.lg },
});

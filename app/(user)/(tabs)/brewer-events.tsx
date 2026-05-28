import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { openBrowserAsync } from "expo-web-browser";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import Input from "../../../src/components/Input";
import Button from "../../../src/components/Button";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";
import {
  BreweryEventParticipant,
  BreweryPost,
  buildBreweryEventParticipantsPdfUrl,
  listBreweryPostParticipantsApi,
  listMyBreweryPostsApi,
  reviewBreweryPostParticipationApi,
} from "../../../src/api/brewerApi";
import { useAuth } from "../../../src/store/useAuth";

function statusLabel(status: BreweryPost["status"]) {
  if (status === "VALIDE") return "Valide";
  if (status === "REJETE") return "Rejete";
  return "En attente";
}

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

function isDeadlineReached(value?: string | null) {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() <= Date.now();
}

export default function BrewerEventsScreen() {
  const { token } = useAuth();
  const [items, setItems] = useState<BreweryPost[]>([]);
  const [exportingId, setExportingId] = useState<number | null>(null);
  const [participantsLoadingId, setParticipantsLoadingId] = useState<number | null>(null);
  const [visibleParticipantsForId, setVisibleParticipantsForId] = useState<number | null>(null);
  const [participantsByPostId, setParticipantsByPostId] = useState<Record<number, BreweryEventParticipant[]>>({});
  const [reviewBusyKey, setReviewBusyKey] = useState<string | null>(null);
  const [rejectReasonsByParticipationId, setRejectReasonsByParticipationId] = useState<Record<number, string>>({});

  async function load() {
    const res = await listMyBreweryPostsApi();
    setItems(res.items ?? []);
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = new Date(a.startAt || a.publishedAt || a.createdAt || 0).getTime();
      const second = new Date(b.startAt || b.publishedAt || b.createdAt || 0).getTime();
      return second - first;
    });
  }, [items]);

  async function onShowParticipants(item: BreweryPost) {
    if (visibleParticipantsForId === item.id) {
      setVisibleParticipantsForId(null);
      return;
    }

    try {
      setParticipantsLoadingId(item.id);
      const res = await listBreweryPostParticipantsApi(item.id);
      setParticipantsByPostId((current) => ({ ...current, [item.id]: res.items ?? [] }));
      setVisibleParticipantsForId(item.id);
    } catch (err: any) {
      Alert.alert("Erreur", err?.message || "Impossible de charger les participants");
    } finally {
      setParticipantsLoadingId(null);
    }
  }

  async function onExportParticipants(item: BreweryPost) {
    if (!token) return Alert.alert("Erreur", "Session introuvable");

    try {
      setExportingId(item.id);
      await openBrowserAsync(buildBreweryEventParticipantsPdfUrl(item.id, token));
    } catch (err: any) {
      Alert.alert("Erreur", err?.message || "Impossible de telecharger le PDF");
    } finally {
      setExportingId(null);
    }
  }

  async function onReviewParticipation(
    postId: number,
    participation: BreweryEventParticipant,
    action: "validate" | "reject"
  ) {
    const reason = (rejectReasonsByParticipationId[participation.id] || "").trim();
    if (action === "reject" && reason.length < 3) {
      return Alert.alert("Erreur", "Motif de rejet requis");
    }

    try {
      setReviewBusyKey(`${participation.id}-${action}`);
      await reviewBreweryPostParticipationApi(postId, participation.id, {
        action,
        rejectReason: action === "reject" ? reason : undefined,
      });
      const res = await listBreweryPostParticipantsApi(postId);
      setParticipantsByPostId((current) => ({ ...current, [postId]: res.items ?? [] }));
      if (action === "reject") {
        setRejectReasonsByParticipationId((current) => ({ ...current, [participation.id]: "" }));
      }
    } catch (err: any) {
      Alert.alert("Erreur", err?.message || "Impossible de traiter cette participation");
    } finally {
      setReviewBusyKey(null);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.push("/(user)/(tabs)/brewer" as any)} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={20} color={colors.text as any} />
        </Pressable>
        <Text style={styles.title}>Evenements brasseur</Text>
        <View style={{ width: 40 }} />
      </View>
      <Text style={styles.subtitle}>Proposez vos evenements. Ils seront visibles apres validation de l'admin. La liste des participants valides est consultable, et le PDF devient telechargeable apres la date limite.</Text>

      <Button
        label="Ajouter un evenement"
        onPress={() => router.push("/(user)/brewer-event-create" as any)}
        style={styles.createButton}
      />

      <Text style={styles.sectionTitle}>Mes evenements</Text>
      {sortedItems.map((item) => {
        const canExport = item.status === "VALIDE" && isDeadlineReached(item.registrationDeadline);
        const isParticipantsVisible = visibleParticipantsForId === item.id;
        const participants = participantsByPostId[item.id] ?? [];
        const pendingParticipants = participants.filter((entry) => entry.status === "EN_ATTENTE");
        const validatedParticipants = participants.filter((entry) => entry.status === "VALIDE");
        const rejectedParticipants = participants.filter((entry) => entry.status === "REJETE");

        return (
          <View key={item.id} style={styles.listCard}>
            <View style={styles.rowTop}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <View style={styles.badge}><Text style={styles.badgeText}>{statusLabel(item.status)}</Text></View>
            </View>
            <Text style={styles.meta}>Debut: {formatDateTime(item.startAt)}</Text>
            <Text style={styles.meta}>Fin: {formatDateTime(item.endAt)}</Text>
            <Text style={styles.meta}>Adresse: {item.address || "A confirmer"}</Text>
            <Text style={styles.meta}>Cloture inscriptions: {formatDateTime(item.registrationDeadline)}</Text>
            <Text style={styles.itemText}>{item.content}</Text>
            {item.rejectReason ? <Text style={styles.reject}>Motif: {item.rejectReason}</Text> : null}

            <Button
              label={participantsLoadingId === item.id ? "Chargement..." : isParticipantsVisible ? "Masquer les demandes" : "Voir les demandes"}
              onPress={() => onShowParticipants(item)}
              disabled={participantsLoadingId === item.id}
              variant="secondary"
              style={styles.secondaryButton}
            />

            {isParticipantsVisible ? (
              <View style={styles.participantsCard}>
                <Text style={styles.participantsTitle}>Demandes de participation</Text>
                {participants.length === 0 ? (
                  <Text style={styles.emptyParticipants}>Aucune demande de participation pour le moment.</Text>
                ) : (
                  <>
                    {pendingParticipants.length > 0 ? (
                      <View style={styles.participantsBlock}>
                        <Text style={styles.participantsSubtitle}>En attente</Text>
                        {pendingParticipants.map((entry, index) => (
                          <View key={entry.id} style={styles.participantRow}>
                            <Text style={styles.participantName}>{index + 1}. {entry.participant?.username || "Utilisateur"}</Text>
                            <Text style={styles.participantEmail}>{entry.participant?.email || "Email non renseigne"}</Text>
                            <Text style={styles.participantDate}>Demande: {formatDateTime(entry.createdAt)}</Text>
                            <Input
                              label="Motif de rejet"
                              value={rejectReasonsByParticipationId[entry.id] || ""}
                              onChangeText={(value: string) => setRejectReasonsByParticipationId((current) => ({ ...current, [entry.id]: value }))}
                            />
                            <View style={styles.reviewActions}>
                              <Button
                                label={reviewBusyKey === `${entry.id}-validate` ? "..." : "Valider"}
                                onPress={() => onReviewParticipation(item.id, entry, "validate")}
                                disabled={reviewBusyKey != null}
                              />
                              <Button
                                label={reviewBusyKey === `${entry.id}-reject` ? "..." : "Rejeter"}
                                variant="secondary"
                                onPress={() => onReviewParticipation(item.id, entry, "reject")}
                                disabled={reviewBusyKey != null}
                              />
                            </View>
                          </View>
                        ))}
                      </View>
                    ) : null}

                    {validatedParticipants.length > 0 ? (
                      <View style={styles.participantsBlock}>
                        <Text style={styles.participantsSubtitle}>Participations validees</Text>
                        {validatedParticipants.map((entry, index) => (
                          <View key={entry.id} style={styles.participantRow}>
                            <Text style={styles.participantName}>{index + 1}. {entry.participant?.username || "Utilisateur"}</Text>
                            <Text style={styles.participantEmail}>{entry.participant?.email || "Email non renseigne"}</Text>
                            <Text style={styles.participantDate}>Validation: {formatDateTime(entry.reviewedAt || entry.createdAt)}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}

                    {rejectedParticipants.length > 0 ? (
                      <View style={styles.participantsBlock}>
                        <Text style={styles.participantsSubtitle}>Participations rejetees</Text>
                        {rejectedParticipants.map((entry, index) => (
                          <View key={entry.id} style={styles.participantRow}>
                            <Text style={styles.participantName}>{index + 1}. {entry.participant?.username || "Utilisateur"}</Text>
                            <Text style={styles.participantEmail}>{entry.participant?.email || "Email non renseigne"}</Text>
                            <Text style={styles.participantDate}>Rejet: {formatDateTime(entry.reviewedAt || entry.createdAt)}</Text>
                            {entry.rejectReason ? <Text style={styles.reject}>Motif: {entry.rejectReason}</Text> : null}
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </>
                )}
              </View>
            ) : null}

            {canExport ? (
              <Button
                label={exportingId === item.id ? "Telechargement..." : "Telecharger la liste PDF"}
                onPress={() => onExportParticipants(item)}
                disabled={exportingId === item.id}
                style={styles.exportButton}
              />
            ) : null}
          </View>
        );
      })}
      {sortedItems.length === 0 ? <Text style={styles.empty}>Aucun evenement propose pour le moment.</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.lg, marginTop: spacing.lg },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadow as any,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  title: { fontSize: typography.h1, fontWeight: "900", color: colors.text },
  subtitle: { color: colors.muted, marginBottom: spacing.lg, lineHeight: 20 },
  createButton: { marginBottom: spacing.lg },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: spacing.lg, marginBottom: spacing.xl },
  sectionTitle: { fontSize: typography.h2, fontWeight: "900", color: colors.text, marginBottom: spacing.md },
  listCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: spacing.md, marginBottom: spacing.md },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  itemTitle: { color: colors.text, fontWeight: "900", fontSize: 16, flex: 1 },
  meta: { color: colors.muted, marginTop: spacing.xs, fontWeight: "700" },
  itemText: { color: colors.text, marginTop: spacing.sm, lineHeight: 19 },
  badge: { backgroundColor: colors.badgeBg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: colors.badgeText, fontWeight: "900", fontSize: 12 },
  reject: { color: colors.dangerText, marginTop: spacing.sm, fontWeight: "700" },
  secondaryButton: { marginTop: spacing.md },
  participantsCard: { marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md },
  participantsTitle: { color: colors.text, fontWeight: "900", fontSize: 15, marginBottom: spacing.sm },
  participantsBlock: { marginTop: spacing.sm },
  participantsSubtitle: { color: colors.text, fontWeight: "800", marginBottom: spacing.sm },
  emptyParticipants: { color: colors.muted },
  participantRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  participantName: { color: colors.text, fontWeight: "800" },
  participantEmail: { color: colors.muted, marginTop: 2 },
  participantDate: { color: colors.muted, marginTop: 2, fontSize: 12 },
  reviewActions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  exportButton: { marginTop: spacing.md },
  empty: { color: colors.muted },
});

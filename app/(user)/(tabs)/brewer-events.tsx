import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { openBrowserAsync } from "expo-web-browser";
import Input from "../../../src/components/Input";
import Button from "../../../src/components/Button";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";
import {
  BreweryEventParticipant,
  BreweryPost,
  buildBreweryEventParticipantsPdfUrl,
  createBreweryPostApi,
  listBreweryPostParticipantsApi,
  listMyBreweryPostsApi,
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

function normalizeDateInput(value: string) {
  return value.trim().replace(" ", "T");
}

function isDeadlineReached(value?: string | null) {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() <= Date.now();
}

export default function BrewerEventsScreen() {
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [address, setAddress] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [items, setItems] = useState<BreweryPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportingId, setExportingId] = useState<number | null>(null);
  const [participantsLoadingId, setParticipantsLoadingId] = useState<number | null>(null);
  const [visibleParticipantsForId, setVisibleParticipantsForId] = useState<number | null>(null);
  const [participantsByPostId, setParticipantsByPostId] = useState<Record<number, BreweryEventParticipant[]>>({});

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
      return first - second;
    });
  }, [items]);

  async function onSubmit() {
    if (!title.trim()) return Alert.alert("Erreur", "Titre de l'evenement requis");
    if (!content.trim()) return Alert.alert("Erreur", "Description de l'evenement requise");
    if (!address.trim()) return Alert.alert("Erreur", "Adresse requise");
    if (!startAt.trim()) return Alert.alert("Erreur", "Date de debut requise");
    if (!endAt.trim()) return Alert.alert("Erreur", "Date de fin requise");
    if (!registrationDeadline.trim()) return Alert.alert("Erreur", "Date limite de participation requise");

    try {
      setLoading(true);
      await createBreweryPostApi({
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim() || null,
        address: address.trim(),
        startAt: normalizeDateInput(startAt),
        endAt: normalizeDateInput(endAt),
        registrationDeadline: normalizeDateInput(registrationDeadline),
      });
      setTitle("");
      setContent("");
      setImageUrl("");
      setAddress("");
      setStartAt("");
      setEndAt("");
      setRegistrationDeadline("");
      await load();
      Alert.alert("Evenement envoye", "Votre evenement a ete envoye pour validation admin.");
    } catch (err: any) {
      Alert.alert("Erreur", err?.message || "Impossible d'envoyer l'evenement");
    } finally {
      setLoading(false);
    }
  }

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Evenements brasseur</Text>
      <Text style={styles.subtitle}>Proposez vos evenements. Ils seront visibles apres validation de l'admin. La liste des participants valides est consultable, et le PDF devient telechargeable apres la date limite.</Text>

      <View style={styles.card}>
        <Input label="Titre de l'evenement" value={title} onChangeText={setTitle} />
        <Input label="Description" value={content} onChangeText={setContent} multiline numberOfLines={5} style={{ minHeight: 110, textAlignVertical: "top" } as any} />
        <Input label="Adresse" value={address} onChangeText={setAddress} />
        <Input label="Date de debut (YYYY-MM-DDTHH:mm)" value={startAt} onChangeText={setStartAt} autoCapitalize="none" />
        <Input label="Date de fin (YYYY-MM-DDTHH:mm)" value={endAt} onChangeText={setEndAt} autoCapitalize="none" />
        <Input label="Date limite de participation (YYYY-MM-DDTHH:mm)" value={registrationDeadline} onChangeText={setRegistrationDeadline} autoCapitalize="none" />
        <Input label="URL image (optionnel)" value={imageUrl} onChangeText={setImageUrl} autoCapitalize="none" />
        <Button label={loading ? "Envoi..." : "Valider le formulaire"} onPress={onSubmit} disabled={loading} />
      </View>

      <Text style={styles.sectionTitle}>Mes evenements</Text>
      {sortedItems.map((item) => {
        const canExport = item.status === "VALIDE" && isDeadlineReached(item.registrationDeadline);
        const isParticipantsVisible = visibleParticipantsForId === item.id;
        const participants = participantsByPostId[item.id] ?? [];

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
              label={participantsLoadingId === item.id ? "Chargement..." : isParticipantsVisible ? "Masquer les participants" : "Voir les participants"}
              onPress={() => onShowParticipants(item)}
              disabled={participantsLoadingId === item.id}
              variant="secondary"
              style={styles.secondaryButton}
            />

            {isParticipantsVisible ? (
              <View style={styles.participantsCard}>
                <Text style={styles.participantsTitle}>Participants valides</Text>
                {participants.length === 0 ? (
                  <Text style={styles.emptyParticipants}>Aucun participant valide pour le moment.</Text>
                ) : (
                  participants.map((entry, index) => (
                    <View key={entry.id} style={styles.participantRow}>
                      <Text style={styles.participantName}>{index + 1}. {entry.participant?.username || "Utilisateur"}</Text>
                      <Text style={styles.participantEmail}>{entry.participant?.email || "Email non renseigne"}</Text>
                      <Text style={styles.participantDate}>Inscription: {formatDateTime(entry.createdAt)}</Text>
                    </View>
                  ))
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
  title: { fontSize: typography.h1, fontWeight: "900", color: colors.text, marginBottom: spacing.sm },
  subtitle: { color: colors.muted, marginBottom: spacing.lg, lineHeight: 20 },
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
  emptyParticipants: { color: colors.muted },
  participantRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  participantName: { color: colors.text, fontWeight: "800" },
  participantEmail: { color: colors.muted, marginTop: 2 },
  participantDate: { color: colors.muted, marginTop: 2, fontSize: 12 },
  exportButton: { marginTop: spacing.md },
  empty: { color: colors.muted },
});

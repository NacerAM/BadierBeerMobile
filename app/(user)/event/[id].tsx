import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { openBrowserAsync } from "expo-web-browser";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Button from "../../../src/components/Button";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";
import { buildMyEventInvitationPdfUrl, getPublicEventApi, participateInEventApi, PublicBreweryEvent } from "../../../src/api/publicContentApi";
import { openMessageConversationApi } from "../../../src/api/messagesApi";
import { useAuth } from "../../../src/store/useAuth";

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

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, token } = useAuth();
  const eventId = Number(id);
  const isAdmin = user?.role === "ADMIN";
  const [event, setEvent] = useState<PublicBreweryEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [contactingBrewer, setContactingBrewer] = useState(false);
  const [contactingAdmin, setContactingAdmin] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const item = await getPublicEventApi(eventId);
      setEvent(item);
    } catch (e: any) {
      setError(e?.message || "Impossible de charger l'evenement");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function onParticipate() {
    if (!event) return;
    try {
      setSubmitting(true);
      await participateInEventApi(event.id);
      await load();
      Alert.alert("Participation envoyee", "Votre demande a ete transmise au brasseur pour validation.");
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de participer a cet evenement");
    } finally {
      setSubmitting(false);
    }
  }

  async function onContactBrewer() {
    try {
      setContactingBrewer(true);
      const conversation = await openMessageConversationApi({ targetType: "EVENT", targetId: eventId });
      router.push({ pathname: "/(user)/chat/[id]", params: { id: String(conversation.id) } } as any);
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de contacter le brasseur");
    } finally {
      setContactingBrewer(false);
    }
  }

  async function onContactAdmin() {
    try {
      setContactingAdmin(true);
      const conversation = await openMessageConversationApi({
        targetType: "ADMIN_SUPPORT",
        initialMessage: `Bonjour, je souhaite poser une question au sujet de mon evenement #${eventId}.`,
      });
      router.push({ pathname: "/(user)/chat/[id]", params: { id: String(conversation.id) } } as any);
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de contacter l'administrateur");
    } finally {
      setContactingAdmin(false);
    }
  }

  async function onDownloadInvitation() {
    if (!token || !event) {
      Alert.alert("Erreur", "Session introuvable");
      return;
    }
    try {
      await openBrowserAsync(buildMyEventInvitationPdfUrl(event.id, token));
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de telecharger l'invitation");
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator /><Text style={styles.muted}>Chargement...</Text></View>;
  if (error || !event) return <View style={styles.center}><Text style={styles.error}>{error || "Evenement introuvable"}</Text></View>;

  const isOwnBrewerEvent = event.Manufacturer?.ownerUserId != null && user?.id === event.Manufacturer.ownerUserId;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}><Ionicons name="chevron-back" size={20} color={colors.text as any} /></Pressable>
        <Text style={styles.title}>Evenement</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.heroCard}>
        {event.imageUrl ? <Image source={{ uri: event.imageUrl }} style={styles.heroImage} resizeMode="cover" /> : null}
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.breweryName}>{event.Manufacturer?.name || "Brasserie"}</Text>
      </View>

      <View style={styles.paper}>
        <Text style={styles.sectionTitle}>Details</Text>
        <Text style={styles.meta}>Debut: {formatDateTime(event.startAt || event.publishedAt)}</Text>
        <Text style={styles.meta}>Fin: {formatDateTime(event.endAt)}</Text>
        <Text style={styles.meta}>Adresse: {event.address || "A confirmer"}</Text>
        <Text style={styles.meta}>Date limite d'inscription: {formatDateTime(event.registrationDeadline)}</Text>
        <Text style={styles.meta}>Participants valides: {event.participantsCount ?? 0}</Text>

        <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Description</Text>
        <Text style={styles.description}>{event.content}</Text>

        {event.myParticipationStatus === "VALIDE" ? <Text style={styles.statusInfo}>Votre participation est validee.</Text> : null}
        {event.myParticipationStatus === "EN_ATTENTE" ? <Text style={styles.statusInfo}>Votre participation est en attente de validation.</Text> : null}
        {event.myParticipationStatus === "REJETE" ? (
          <Text style={styles.statusInfo}>
            Votre participation a ete rejetee{event.myParticipationRejectReason ? ` - Motif: ${event.myParticipationRejectReason}` : "."}
          </Text>
        ) : null}
        {!event.myParticipationStatus && event.registrationClosed ? <Text style={styles.statusInfo}>Les inscriptions sont cloturees.</Text> : null}

        <View style={styles.actionStack}>
          {!isAdmin && isOwnBrewerEvent ? (
            <Button label={contactingAdmin ? "Ouverture..." : "Contacter l'admin"} variant="secondary" onPress={onContactAdmin} disabled={contactingAdmin} />
          ) : null}
          {!isAdmin && !isOwnBrewerEvent ? (
            <Button label={contactingBrewer ? "Ouverture..." : "Contacter le brasseur"} variant="secondary" onPress={onContactBrewer} disabled={contactingBrewer} />
          ) : null}
          {event.myParticipationStatus === "VALIDE" ? (
            <Button label="Telecharger l'invitation" variant="secondary" onPress={onDownloadInvitation} />
          ) : null}
          {!isOwnBrewerEvent && !event.myParticipationStatus && !event.registrationClosed ? (
            <Button label={submitting ? "Envoi..." : "Participer a l'evenement"} onPress={onParticipate} disabled={submitting} />
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.lg, marginTop: spacing.lg },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", shadowColor: colors.shadow as any, shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  title: { fontSize: typography.h1, fontWeight: "900", color: colors.text },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm, padding: spacing.lg },
  muted: { color: colors.muted },
  error: { color: colors.dangerText, fontWeight: "900", textAlign: "center" },
  heroCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, overflow: "hidden", marginBottom: spacing.lg },
  heroImage: { width: "100%", height: 210, backgroundColor: colors.bg2 },
  eventTitle: { color: colors.text, fontWeight: "900", fontSize: 24, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  breweryName: { color: colors.muted, fontWeight: "700", paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, marginTop: spacing.xs },
  paper: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: spacing.lg },
  sectionTitle: { color: colors.text, fontWeight: "900", fontSize: 16 },
  meta: { color: colors.muted, fontWeight: "700", marginTop: spacing.sm },
  description: { color: colors.text, lineHeight: 21, marginTop: spacing.sm },
  statusInfo: { color: colors.primaryDark, fontWeight: "900", marginTop: spacing.md },
  actionStack: { marginTop: spacing.lg, gap: spacing.sm },
});

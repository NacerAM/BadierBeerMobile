import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import Button from "../../../src/components/Button";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";
import { getPublicEventApi, participateInEventApi, PublicBreweryEvent } from "../../../src/api/publicContentApi";

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
  const eventId = Number(id);
  const [event, setEvent] = useState<PublicBreweryEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
      Alert.alert("Participation envoyee", "Votre demande a ete transmise pour validation admin.");
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de participer a cet evenement");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator /><Text style={styles.muted}>Chargement...</Text></View>;
  if (error || !event) return <View style={styles.center}><Text style={styles.error}>{error || "Evenement introuvable"}</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={styles.back}>‹</Text></Pressable>
        <Text style={styles.title}>Evenement</Text>
        <View style={{ width: 30 }} />
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
        {!event.myParticipationStatus && event.registrationClosed ? <Text style={styles.statusInfo}>Les inscriptions sont cloturees.</Text> : null}

        {!event.myParticipationStatus && !event.registrationClosed ? (
          <Button label={submitting ? "Envoi..." : "Participer a l'evenement"} onPress={onParticipate} disabled={submitting} style={styles.actionButton} />
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.lg, marginTop: spacing.lg },
  back: { fontSize: 26, fontWeight: "900", color: colors.text, marginTop: -2 },
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
  actionButton: { marginTop: spacing.lg },
});

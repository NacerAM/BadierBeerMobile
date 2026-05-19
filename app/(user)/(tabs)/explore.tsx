import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, ActivityIndicator, Image, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";
import Button from "../../../src/components/Button";
import {
  listPublicProductsApi,
  listUpcomingEventsApi,
  participateInEventApi,
  PublicBreweryEvent,
  PublicBreweryProduct,
} from "../../../src/api/publicContentApi";
import { openMessageConversationApi } from "../../../src/api/messagesApi";

type ExploreMode = "events" | "products";

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

function participationLabel(item: PublicBreweryEvent) {
  if (item.myParticipationStatus === "VALIDE") return "Participation validee";
  if (item.myParticipationStatus === "EN_ATTENTE") return "Participation en attente de validation";
  if (item.registrationClosed) return "Inscriptions cloturees";
  return null;
}

export default function ExploreScreen() {
  const [mode, setMode] = useState<ExploreMode>("events");
  const [q, setQ] = useState("");
  const [products, setProducts] = useState<PublicBreweryProduct[]>([]);
  const [events, setEvents] = useState<PublicBreweryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingEventId, setSubmittingEventId] = useState<number | null>(null);
  const [contactingKey, setContactingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [productsRes, eventsRes] = await Promise.all([
        listPublicProductsApi(),
        listUpcomingEventsApi(),
      ]);
      setProducts(productsRes.items ?? []);
      setEvents(eventsRes.items ?? []);
    } catch (e: any) {
      setError(e?.message || "Erreur reseau");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filteredProducts = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return products;
    return products.filter((item) =>
      item.name.toLowerCase().includes(query) ||
      (item.Manufacturer?.name || "").toLowerCase().includes(query) ||
      (item.description || "").toLowerCase().includes(query)
    );
  }, [q, products]);

  const filteredEvents = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return events;
    return events.filter((item) =>
      item.title.toLowerCase().includes(query) ||
      (item.Manufacturer?.name || "").toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query) ||
      (item.address || "").toLowerCase().includes(query)
    );
  }, [q, events]);

  async function onParticipate(eventId: number) {
    try {
      setSubmittingEventId(eventId);
      await participateInEventApi(eventId);
      await load();
      Alert.alert("Participation envoyee", "Votre demande a ete transmise pour validation admin.");
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de participer a cet evenement");
    } finally {
      setSubmittingEventId(null);
    }
  }

  async function contactBrewerForProduct(productId: number) {
    try {
      setContactingKey(`product-${productId}`);
      const conversation = await openMessageConversationApi({ targetType: "PRODUCT", targetId: productId });
      router.push({ pathname: "/(user)/chat/[id]", params: { id: String(conversation.id) } } as any);
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de contacter ce brasseur");
    } finally {
      setContactingKey(null);
    }
  }

  async function contactBrewerForEvent(eventId: number) {
    try {
      setContactingKey(`event-${eventId}`);
      const conversation = await openMessageConversationApi({ targetType: "EVENT", targetId: eventId });
      router.push({ pathname: "/(user)/chat/[id]", params: { id: String(conversation.id) } } as any);
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de contacter ce brasseur");
    } finally {
      setContactingKey(null);
    }
  }

  function renderEvent(item: PublicBreweryEvent) {
    return (
      <View style={styles.card}>
        {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" /> : null}
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardMeta}>{item.Manufacturer?.name || "Brasserie"}</Text>
        <Text style={styles.cardMeta}>Debut: {formatDateTime(item.startAt || item.publishedAt)}</Text>
        <Text style={styles.cardMeta}>Fin: {formatDateTime(item.endAt)}</Text>
        <Text style={styles.cardMeta}>Adresse: {item.address || "A confirmer"}</Text>
        <Text style={styles.cardMeta}>Date limite: {formatDateTime(item.registrationDeadline)}</Text>
        <Text style={styles.cardMeta}>Participants valides: {item.participantsCount ?? 0}</Text>
        <Text style={styles.cardText}>{item.content}</Text>
        {participationLabel(item) ? <Text style={styles.statusInfo}>{participationLabel(item)}</Text> : null}
        <View style={styles.actionStack}>
          <Button label="Voir details" variant="secondary" onPress={() => router.push({ pathname: "/(user)/event/[id]", params: { id: String(item.id) } } as any)} />
          <Button label={contactingKey === `event-${item.id}` ? "Ouverture..." : "Contacter le brasseur"} variant="secondary" onPress={() => contactBrewerForEvent(item.id)} disabled={contactingKey != null} />
          {!item.myParticipationStatus && !item.registrationClosed ? (
            <Button
              label={submittingEventId === item.id ? "Envoi..." : "Participer"}
              onPress={() => onParticipate(item.id)}
              disabled={submittingEventId === item.id}
            />
          ) : null}
        </View>
      </View>
    );
  }

  function renderProduct(item: PublicBreweryProduct) {
    return (
      <View style={styles.card}>
        {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" /> : null}
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardMeta}>{item.Manufacturer?.name || "Brasserie"}</Text>
        <Text style={styles.cardText}>{item.description || "Aucune description"}</Text>
        <Text style={styles.price}>{item.price ? `${item.price} ${item.currency}` : "Prix non renseigne"}</Text>
        <Button label={contactingKey === `product-${item.id}` ? "Ouverture..." : "Contacter le brasseur"} variant="secondary" onPress={() => contactBrewerForProduct(item.id)} disabled={contactingKey != null} style={styles.actionButton} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explorer</Text>
      <Text style={styles.subtitle}>Consultez les evenements a venir et les produits mis en vente par les brasseries.</Text>

      <View style={styles.segmentWrap}>
        <Pressable onPress={() => setMode("events")} style={[styles.segment, mode === "events" ? styles.segmentActive : null]}>
          <Text style={[styles.segmentText, mode === "events" ? styles.segmentTextActive : null]}>Evenements</Text>
        </Pressable>
        <Pressable onPress={() => setMode("products")} style={[styles.segment, mode === "products" ? styles.segmentActive : null]}>
          <Text style={[styles.segmentText, mode === "products" ? styles.segmentTextActive : null]}>Produits</Text>
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={colors.muted as any} style={styles.searchIcon} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={mode === "events" ? "Rechercher un evenement..." : "Rechercher un produit..."}
          placeholderTextColor={colors.muted}
          style={styles.search}
          autoCapitalize="none"
        />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator /><Text style={styles.centerText}>Chargement...</Text></View>
      ) : error ? (
        <View style={styles.center}><Text style={styles.errorText}>{error}</Text><Text style={styles.retry} onPress={load}>Reessayer</Text></View>
      ) : mode === "events" ? (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => renderEvent(item)}
          ListEmptyComponent={<Text style={styles.empty}>Aucun contenu disponible.</Text>}
        />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => renderProduct(item)}
          ListEmptyComponent={<Text style={styles.empty}>Aucun contenu disponible.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing.lg, paddingHorizontal: spacing.lg, backgroundColor: colors.bg },
  title: { fontSize: typography.h1, fontWeight: "900", color: colors.text, marginBottom: spacing.sm, textAlign: "center" },
  subtitle: { color: colors.muted, textAlign: "center", marginBottom: spacing.lg, lineHeight: 20 },
  segmentWrap: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  segment: { flex: 1, borderRadius: 14, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: "center" },
  segmentActive: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  segmentText: { color: colors.text, fontWeight: "900" },
  segmentTextActive: { color: "#2E1A0F" },
  searchWrap: { flexDirection: "row", alignItems: "center", gap: spacing.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 16, marginBottom: spacing.lg },
  searchIcon: { marginRight: 2 },
  search: { flex: 1, color: colors.text, paddingVertical: 2 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  centerText: { color: colors.muted },
  errorText: { color: colors.dangerText, fontWeight: "800", textAlign: "center" },
  retry: { color: colors.primaryDark, fontWeight: "900" },
  list: { gap: spacing.md, paddingBottom: spacing.xxl },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: spacing.md, marginBottom: spacing.md },
  cardImage: { width: "100%", height: 170, borderRadius: 14, marginBottom: spacing.md, backgroundColor: colors.bg2 },
  cardTitle: { color: colors.text, fontWeight: "900", fontSize: 18 },
  cardMeta: { color: colors.muted, marginTop: spacing.xs, fontWeight: "700" },
  cardText: { color: colors.text, marginTop: spacing.sm, lineHeight: 20 },
  statusInfo: { color: colors.primaryDark, marginTop: spacing.sm, fontWeight: "800" },
  actionStack: { marginTop: spacing.md, gap: spacing.sm },
  actionButton: { marginTop: spacing.md },
  price: { color: colors.primaryDark, marginTop: spacing.md, fontWeight: "900" },
  empty: { marginTop: spacing.lg, textAlign: "center", color: colors.muted },
});

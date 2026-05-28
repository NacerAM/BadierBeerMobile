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
import { useAuth } from "../../../src/store/useAuth";

type ExploreMode = "events" | "products";
type BrewerScope = "all" | "mine";

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
  if (item.myParticipationStatus === "EN_ATTENTE") return "Participation en attente de validation par le brasseur";
  if (item.myParticipationStatus === "REJETE") {
    return item.myParticipationRejectReason
      ? `Participation rejetee · Motif: ${item.myParticipationRejectReason}`
      : "Participation rejetee";
  }
  if (item.registrationClosed) return "Inscriptions cloturees";
  return null;
}

export default function ExploreScreen() {
  const { user } = useAuth();
  const [mode, setMode] = useState<ExploreMode>("events");
  const [scope, setScope] = useState<BrewerScope>("all");
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
    return products.filter((item) => {
      const matchesText =
        !query ||
        item.name.toLowerCase().includes(query) ||
        (item.Manufacturer?.name || "").toLowerCase().includes(query) ||
        (item.description || "").toLowerCase().includes(query);

      if (!matchesText) return false;

      if (user?.role === "BREWER" && scope === "mine") {
        return item.Manufacturer?.ownerUserId === user.id;
      }

      return true;
    });
  }, [q, products, scope, user?.id, user?.role]);

  const filteredEvents = useMemo(() => {
    const query = q.trim().toLowerCase();
    return events.filter((item) => {
      const matchesText =
        !query ||
        item.title.toLowerCase().includes(query) ||
        (item.Manufacturer?.name || "").toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        (item.address || "").toLowerCase().includes(query);

      if (!matchesText) return false;

      if (user?.role === "BREWER" && scope === "mine") {
        return item.Manufacturer?.ownerUserId === user.id;
      }

      return true;
    }).sort((a, b) => {
      const first = new Date(a.startAt || a.publishedAt || a.createdAt || 0).getTime();
      const second = new Date(b.startAt || b.publishedAt || b.createdAt || 0).getTime();
      return second - first;
    });
  }, [q, events, scope, user?.id, user?.role]);

  async function onParticipate(eventId: number) {
    try {
      setSubmittingEventId(eventId);
      await participateInEventApi(eventId);
      await load();
      Alert.alert("Participation envoyee", "Votre demande a ete transmise au brasseur pour validation.");
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

  function renderEvent(item: PublicBreweryEvent) {
    const isOwnBrewerEvent = item.Manufacturer?.ownerUserId != null && user?.id === item.Manufacturer.ownerUserId;
    return (
      <Pressable style={styles.card} onPress={() => router.push({ pathname: "/(user)/event/[id]", params: { id: String(item.id) } } as any)}>
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
          {!isOwnBrewerEvent && !item.myParticipationStatus && !item.registrationClosed ? (
            <Button
              label={submittingEventId === item.id ? "Envoi..." : "Participer"}
              onPress={() => onParticipate(item.id)}
              disabled={submittingEventId === item.id}
            />
          ) : null}
        </View>
      </Pressable>
    );
  }

  function renderProduct(item: PublicBreweryProduct) {
    const isOwnProduct = item.Manufacturer?.ownerUserId != null && user?.id === item.Manufacturer.ownerUserId;
    return (
      <Pressable
        style={styles.card}
        onPress={() => router.push({ pathname: "/(user)/product/[id]", params: { id: String(item.id), product: JSON.stringify(item) } } as any)}
      >
        {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" /> : null}
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardMeta}>{item.Manufacturer?.name || "Brasserie"}</Text>
        <Text style={styles.cardText}>{item.description || "Aucune description"}</Text>
        <Text style={styles.price}>{item.price ? `${item.price} ${item.currency}` : "Prix non renseigne"}</Text>
        {!isOwnProduct ? (
          <Button label={contactingKey === `product-${item.id}` ? "Ouverture..." : "Contacter le brasseur"} variant="secondary" onPress={() => contactBrewerForProduct(item.id)} disabled={contactingKey != null} style={styles.actionButton} />
        ) : null}
      </Pressable>
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

      {user?.role === "BREWER" ? (
        <View style={styles.scopeWrap}>
          <Pressable onPress={() => setScope("all")} style={[styles.scopeChip, scope === "all" ? styles.scopeChipActive : null]}>
            <Text style={[styles.scopeChipText, scope === "all" ? styles.scopeChipTextActive : null]}>Tout</Text>
          </Pressable>
          <Pressable onPress={() => setScope("mine")} style={[styles.scopeChip, scope === "mine" ? styles.scopeChipActive : null]}>
            <Text style={[styles.scopeChipText, scope === "mine" ? styles.scopeChipTextActive : null]}>
              {mode === "events" ? "Mes evenements" : "Mes produits"}
            </Text>
          </Pressable>
        </View>
      ) : null}

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
  scopeWrap: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  scopeChip: { borderRadius: 999, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  scopeChipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primaryDark },
  scopeChipText: { color: colors.text, fontWeight: "800", fontSize: 12 },
  scopeChipTextActive: { color: colors.primaryDark },
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

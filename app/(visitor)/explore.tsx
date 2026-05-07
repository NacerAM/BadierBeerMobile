import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, ActivityIndicator, Image } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";
import {
  listPublicProductsApi,
  listUpcomingEventsApi,
  PublicBreweryEvent,
  PublicBreweryProduct,
} from "../../src/api/publicContentApi";

type ExploreMode = "events" | "products";

export default function ExploreVisitorScreen() {
  const [mode, setMode] = useState<ExploreMode>("events");
  const [q, setQ] = useState("");
  const [products, setProducts] = useState<PublicBreweryProduct[]>([]);
  const [events, setEvents] = useState<PublicBreweryEvent[]>([]);
  const [loading, setLoading] = useState(true);
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
      setError(e?.message || "Erreur réseau");
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
      item.content.toLowerCase().includes(query)
    );
  }, [q, events]);

  function formatDate(value?: string | null) {
    if (!value) return "Date à confirmer";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "Date à confirmer";
    return d.toLocaleDateString("fr-BE", { day: "2-digit", month: "long", year: "numeric" });
  }

  const data = mode === "events" ? filteredEvents : filteredProducts;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explorer</Text>
      <Text style={styles.subtitle}>Consultez les événements validés et les produits publics des brasseries.</Text>

      <View style={styles.segmentWrap}>
        <Pressable onPress={() => setMode("events")} style={[styles.segment, mode === "events" ? styles.segmentActive : null]}>
          <Text style={[styles.segmentText, mode === "events" ? styles.segmentTextActive : null]}>Événements</Text>
        </Pressable>
        <Pressable onPress={() => setMode("products")} style={[styles.segment, mode === "products" ? styles.segmentActive : null]}>
          <Text style={[styles.segmentText, mode === "products" ? styles.segmentTextActive : null]}>Produits</Text>
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔎</Text>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={mode === "events" ? "Rechercher un événement…" : "Rechercher un produit…"}
          placeholderTextColor={colors.muted}
          style={styles.search}
          autoCapitalize="none"
        />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator /><Text style={styles.centerText}>Chargement…</Text></View>
      ) : error ? (
        <View style={styles.center}><Text style={styles.errorText}>{error}</Text><Text style={styles.retry} onPress={load}>Réessayer</Text></View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => mode === "events" ? (
            <View style={styles.card}>
              {(item as PublicBreweryEvent).imageUrl ? (
                <Image source={{ uri: (item as PublicBreweryEvent).imageUrl! }} style={styles.cardImage} resizeMode="cover" />
              ) : null}
              <Text style={styles.cardTitle}>{(item as PublicBreweryEvent).title}</Text>
              <Text style={styles.cardMeta}>{formatDate((item as PublicBreweryEvent).publishedAt)} · {(item as PublicBreweryEvent).Manufacturer?.name || "Brasserie"}</Text>
              <Text style={styles.cardText}>{(item as PublicBreweryEvent).content}</Text>
            </View>
          ) : (
            <View style={styles.card}>
              {(item as PublicBreweryProduct).imageUrl ? (
                <Image source={{ uri: (item as PublicBreweryProduct).imageUrl! }} style={styles.cardImage} resizeMode="cover" />
              ) : null}
              <Text style={styles.cardTitle}>{(item as PublicBreweryProduct).name}</Text>
              <Text style={styles.cardMeta}>{(item as PublicBreweryProduct).Manufacturer?.name || "Brasserie"}</Text>
              <Text style={styles.cardText}>{(item as PublicBreweryProduct).description || "Aucune description"}</Text>
              <Text style={styles.price}>{(item as PublicBreweryProduct).price ? `${(item as PublicBreweryProduct).price} ${(item as PublicBreweryProduct).currency}` : "Prix non renseigné"}</Text>
            </View>
          )}
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
  searchIcon: { color: colors.muted, fontSize: 16, fontWeight: "900" },
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
  price: { color: colors.primaryDark, marginTop: spacing.md, fontWeight: "900" },
  empty: { marginTop: spacing.lg, textAlign: "center", color: colors.muted },
});

import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Button from "../../../src/components/Button";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { AdminProduct, deleteAdminProductApi, listAdminProductsApi } from "../../../src/api/adminApi";

export default function AdminProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Number(id);
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listAdminProductsApi();
      const item = (res.items || []).find((entry) => Number(entry.id) === productId) || null;
      if (!item) {
        setProduct(null);
        setError("Produit introuvable");
        return;
      }
      setProduct(item);
    } catch (e: any) {
      setError(e?.message || "Impossible de charger ce produit");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  function contentStatusLabel(status: "EN_ATTENTE" | "VALIDE" | "REJETE") {
    if (status === "VALIDE") return "Valide";
    if (status === "REJETE") return "Rejete";
    return "En attente";
  }

  function onDelete() {
    if (!product) return;
    Alert.alert("Suppression definitive", "Etes vous sur de vouloir supprimer ce produit definitivement ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "OK",
        style: "destructive",
        onPress: async () => {
          try {
            setBusy(true);
            await deleteAdminProductApi(product.id);
            Alert.alert("Supprime", "Le produit a ete supprime definitivement.", [
              { text: "OK", onPress: () => router.back() },
            ]);
          } catch (e: any) {
            Alert.alert("Erreur", e?.message || "Impossible de supprimer ce produit");
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.centerText}>Chargement...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || "Produit introuvable"}</Text>
        <Button label="Reessayer" onPress={load} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={20} color={colors.text as any} />
        </Pressable>
        <Text style={styles.topTitle}>Detail du produit</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.card}>
        <View style={styles.imageWrap}>
          {product.imageUrl ? <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" /> : <Text style={styles.imageEmoji}>🍺</Text>}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{contentStatusLabel(product.status)}</Text>
          </View>
        </View>

        <Text style={styles.title}>{product.name}</Text>
        {product.Manufacturer?.owner?.username ? <Text style={styles.meta}>Ajoute par {product.Manufacturer.owner.username}</Text> : null}
        <Text style={styles.meta}>{product.Manufacturer?.name || "Brasserie"}</Text>
        <Text style={styles.meta}>{product.price != null ? `${product.price} ${product.currency || "EUR"}` : "Prix non renseigne"}</Text>
        <Text style={styles.meta}>Disponibilite: {product.isAvailable ? "En vente" : "Masque"}</Text>
        {product.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <Button label="Modifier" onPress={() => router.push({ pathname: "/(user)/admin-product-edit/[id]", params: { id: String(product.id) } } as any)} disabled={busy} />
          <Button label={busy ? "Suppression..." : "Supprimer"} variant="secondary" onPress={onDelete} disabled={busy} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  topBar: { paddingTop: spacing.xl, paddingBottom: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  topTitle: { fontSize: 16, fontWeight: "900", color: colors.text },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: spacing.lg },
  imageWrap: { height: 260, borderRadius: 14, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: colors.bg2, marginBottom: spacing.md },
  image: { width: "100%", height: "100%" },
  imageEmoji: { fontSize: 44, color: colors.muted },
  badge: { position: "absolute", left: spacing.sm, bottom: spacing.sm, backgroundColor: colors.badgeBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { color: colors.badgeText, fontWeight: "900", fontSize: 12 },
  title: { fontSize: 22, fontWeight: "900", color: colors.text, textAlign: "center" },
  meta: { color: colors.muted, fontWeight: "700", marginTop: spacing.xs, textAlign: "center" },
  section: { marginTop: spacing.lg },
  sectionTitle: { fontSize: 14, fontWeight: "900", color: colors.text, marginBottom: spacing.sm },
  description: { color: colors.text, lineHeight: 20 },
  actions: { marginTop: spacing.lg, gap: spacing.sm },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.lg },
  centerText: { color: colors.muted },
  errorText: { color: colors.dangerText, fontWeight: "900", textAlign: "center" },
});

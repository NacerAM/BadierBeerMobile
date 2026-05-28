import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Input from "../../../src/components/Input";
import Button from "../../../src/components/Button";
import ImageUploadField from "../../../src/components/ImageUploadField";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { AdminProduct, listAdminProductsApi, updateAdminProductApi } from "../../../src/api/adminApi";

export default function AdminProductEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Number(id);
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      setName(item.name || "");
      setDescription(item.description || "");
      setPrice(item.price != null ? String(item.price) : "");
      setImageUrl(item.imageUrl || null);
      setIsAvailable(item.isAvailable !== false);
    } catch (e: any) {
      setError(e?.message || "Impossible de charger ce produit");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  async function onSave() {
    if (!name.trim()) {
      Alert.alert("Erreur", "Le nom du produit est requis");
      return;
    }
    try {
      setSaving(true);
      await updateAdminProductApi(productId, {
        name: name.trim(),
        description: description.trim() || null,
        price: price.trim() ? Number(price.trim()) : null,
        imageUrl: imageUrl || null,
        isAvailable,
      });
      Alert.alert("Enregistre", "Le produit a ete modifie", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de modifier ce produit");
    } finally {
      setSaving(false);
    }
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
        <Text style={styles.topTitle}>Modifier le produit</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.card}>
        <View style={styles.imageWrap}>
          {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" /> : <Text style={styles.imageEmoji}>🍺</Text>}
        </View>
        {product.Manufacturer?.owner?.username ? <Text style={styles.meta}>Ajoute par {product.Manufacturer.owner.username}</Text> : null}
        <Text style={styles.meta}>{product.Manufacturer?.name || "Brasserie"}</Text>

        <Input label="Nom" value={name} onChangeText={setName} />
        <Input label="Description" value={description} onChangeText={setDescription} multiline style={styles.multilineInput} />
        <Input label="Prix" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
        <ImageUploadField label="Image du produit (optionnel)" value={imageUrl} onChange={setImageUrl} />
        <Text style={styles.meta}>Disponibilite: {isAvailable ? "En vente" : "Masque"}</Text>
        <View style={styles.toggleRow}>
          <Button label={isAvailable ? "Masquer" : "Rendre visible"} variant="secondary" onPress={() => setIsAvailable((current) => !current)} disabled={saving} />
        </View>

        <View style={styles.actions}>
          <Button label={saving ? "Validation..." : "Valider les modifications"} onPress={onSave} disabled={saving} />
          <Button label="Annuler" variant="secondary" onPress={() => router.back()} disabled={saving} />
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
  imageWrap: { height: 220, borderRadius: 14, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: colors.bg2, marginBottom: spacing.md },
  image: { width: "100%", height: "100%" },
  imageEmoji: { fontSize: 40, color: colors.muted },
  meta: { color: colors.muted, fontWeight: "700", marginBottom: spacing.xs },
  multilineInput: { minHeight: 110, textAlignVertical: "top" },
  toggleRow: { marginBottom: spacing.sm },
  actions: { marginTop: spacing.sm, gap: spacing.sm },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.lg },
  centerText: { color: colors.muted },
  errorText: { color: colors.dangerText, fontWeight: "900", textAlign: "center" },
});

import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import Input from "../../../src/components/Input";
import Button from "../../../src/components/Button";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";
import { BreweryProduct, createBreweryProductApi, listMyBreweryProductsApi } from "../../../src/api/brewerApi";

function statusLabel(status: BreweryProduct["status"]) {
  if (status === "VALIDE") return "Validé";
  if (status === "REJETE") return "Rejeté";
  return "En attente";
}

export default function BrewerProductsScreen() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [items, setItems] = useState<BreweryProduct[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await listMyBreweryProductsApi();
    setItems(res.items ?? []);
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  async function onSubmit() {
    if (!name.trim()) return Alert.alert("Erreur", "Nom du produit requis");
    if (!description.trim()) return Alert.alert("Erreur", "Description requise");

    try {
      setLoading(true);
      await createBreweryProductApi({
        name: name.trim(),
        description: description.trim(),
        price: price.trim() ? Number(price.replace(",", ".")) : null,
        imageUrl: imageUrl.trim() || null,
      });
      setName("");
      setDescription("");
      setPrice("");
      setImageUrl("");
      await load();
      Alert.alert("Produit envoyé", "Votre produit a été envoyé pour validation admin.");
    } catch (err: any) {
      Alert.alert("Erreur", err?.message || "Impossible d’envoyer le produit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Produits brasseur</Text>
      <Text style={styles.subtitle}>Proposez vos produits à la vente. Ils seront visibles après validation de l’admin.</Text>

      <View style={styles.card}>
        <Input label="Nom du produit" value={name} onChangeText={setName} />
        <Input label="Description" value={description} onChangeText={setDescription} multiline numberOfLines={4} style={{ minHeight: 90, textAlignVertical: "top" } as any} />
        <Input label="Prix (EUR)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
        <Input label="URL image (optionnel)" value={imageUrl} onChangeText={setImageUrl} autoCapitalize="none" />
        <Button label={loading ? "Envoi..." : "Valider le formulaire"} onPress={onSubmit} disabled={loading} />
      </View>

      <Text style={styles.sectionTitle}>Mes produits</Text>
      {items.map((item) => (
        <View key={item.id} style={styles.listCard}>
          <View style={styles.rowTop}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{statusLabel(item.status)}</Text></View>
          </View>
          <Text style={styles.itemText}>{item.description || "Aucune description"}</Text>
          <Text style={styles.itemMeta}>{item.price ? `${item.price} ${item.currency}` : "Prix non renseigné"}</Text>
          {item.rejectReason ? <Text style={styles.reject}>Motif: {item.rejectReason}</Text> : null}
        </View>
      ))}
      {items.length === 0 ? <Text style={styles.empty}>Aucun produit proposé pour le moment.</Text> : null}
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
  itemText: { color: colors.muted, marginTop: spacing.xs, lineHeight: 19 },
  itemMeta: { color: colors.text, marginTop: spacing.sm, fontWeight: "700" },
  badge: { backgroundColor: colors.badgeBg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: colors.badgeText, fontWeight: "900", fontSize: 12 },
  reject: { color: colors.dangerText, marginTop: spacing.sm, fontWeight: "700" },
  empty: { color: colors.muted },
});

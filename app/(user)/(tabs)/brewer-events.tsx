import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import Input from "../../../src/components/Input";
import Button from "../../../src/components/Button";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";
import { BreweryPost, createBreweryPostApi, listMyBreweryPostsApi } from "../../../src/api/brewerApi";

function statusLabel(status: BreweryPost["status"]) {
  if (status === "VALIDE") return "Validé";
  if (status === "REJETE") return "Rejeté";
  return "En attente";
}

export default function BrewerEventsScreen() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [items, setItems] = useState<BreweryPost[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await listMyBreweryPostsApi();
    setItems(res.items ?? []);
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  async function onSubmit() {
    if (!title.trim()) return Alert.alert("Erreur", "Titre de l’événement requis");
    if (!content.trim()) return Alert.alert("Erreur", "Description de l’événement requise");

    try {
      setLoading(true);
      await createBreweryPostApi({
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim() || null,
      });
      setTitle("");
      setContent("");
      setImageUrl("");
      await load();
      Alert.alert("Événement envoyé", "Votre événement a été envoyé pour validation admin.");
    } catch (err: any) {
      Alert.alert("Erreur", err?.message || "Impossible d’envoyer l’événement");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Événements brasseur</Text>
      <Text style={styles.subtitle}>Proposez vos événements. Ils seront visibles après validation de l’admin.</Text>

      <View style={styles.card}>
        <Input label="Titre de l’événement" value={title} onChangeText={setTitle} />
        <Input label="Description" value={content} onChangeText={setContent} multiline numberOfLines={5} style={{ minHeight: 110, textAlignVertical: "top" } as any} />
        <Input label="URL image (optionnel)" value={imageUrl} onChangeText={setImageUrl} autoCapitalize="none" />
        <Button label={loading ? "Envoi..." : "Valider le formulaire"} onPress={onSubmit} disabled={loading} />
      </View>

      <Text style={styles.sectionTitle}>Mes événements</Text>
      {items.map((item) => (
        <View key={item.id} style={styles.listCard}>
          <View style={styles.rowTop}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{statusLabel(item.status)}</Text></View>
          </View>
          <Text style={styles.itemText}>{item.content}</Text>
          {item.rejectReason ? <Text style={styles.reject}>Motif: {item.rejectReason}</Text> : null}
        </View>
      ))}
      {items.length === 0 ? <Text style={styles.empty}>Aucun événement proposé pour le moment.</Text> : null}
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
  badge: { backgroundColor: colors.badgeBg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: colors.badgeText, fontWeight: "900", fontSize: 12 },
  reject: { color: colors.dangerText, marginTop: spacing.sm, fontWeight: "700" },
  empty: { color: colors.muted },
});

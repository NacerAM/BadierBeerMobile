import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Button from "../../../src/components/Button";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { AdminPendingGlass, deleteAdminGlassApi, listAdminGlassesApi } from "../../../src/api/adminApi";

export default function AdminGlassDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const glassId = Number(id);
  const [glass, setGlass] = useState<AdminPendingGlass | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageUrl = useMemo(() => {
    const list = glass?.images || [];
    const primary = list.find((img) => img.isPrimary) || list[0];
    return primary?.url || null;
  }, [glass]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listAdminGlassesApi();
      const item = (res.items || []).find((entry) => Number(entry.id) === glassId) || null;
      if (!item) {
        setGlass(null);
        setError("Verre introuvable");
        return;
      }
      setGlass(item);
    } catch (e: any) {
      setError(e?.message || "Impossible de charger ce verre");
    } finally {
      setLoading(false);
    }
  }, [glassId]);

  useEffect(() => {
    load();
  }, [load]);

  function contentStatusLabel(status: "EN_ATTENTE" | "VALIDE" | "REJETE") {
    if (status === "VALIDE") return "Valide";
    if (status === "REJETE") return "Rejete";
    return "En attente";
  }

  function onDelete() {
    if (!glass) return;
    Alert.alert("Suppression definitive", "Etes vous sur de vouloir supprimer ce verre definitivement ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "OK",
        style: "destructive",
        onPress: async () => {
          try {
            setBusy(true);
            await deleteAdminGlassApi(glass.id);
            Alert.alert("Supprime", "Le verre a ete supprime definitivement.", [
              { text: "OK", onPress: () => router.back() },
            ]);
          } catch (e: any) {
            Alert.alert("Erreur", e?.message || "Impossible de supprimer ce verre");
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

  if (error || !glass) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || "Verre introuvable"}</Text>
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
        <Text style={styles.topTitle}>Detail du verre</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.card}>
        <View style={styles.imageWrap}>
          {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" /> : <Text style={styles.imageEmoji}>🍺</Text>}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{contentStatusLabel(glass.status)}</Text>
          </View>
        </View>

        <Text style={styles.title}>{glass.name}</Text>
        {glass.createdBy?.username ? <Text style={styles.meta}>Ajoute par {glass.createdBy.username}</Text> : null}
        <Text style={styles.meta}>{glass.Manufacturer?.name || "Brasserie inconnue"}</Text>
        {glass.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{glass.description}</Text>
          </View>
        ) : null}

        {!!glass.images?.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Images</Text>
            <View style={styles.imagesGrid}>
              {glass.images.map((item) => (
                <Image key={item.id} source={{ uri: item.url }} style={styles.thumb} resizeMode="cover" />
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.actions}>
          <Button label="Modifier" onPress={() => router.push({ pathname: "/(user)/admin-glass-edit/[id]", params: { id: String(glass.id) } } as any)} disabled={busy} />
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
  imagesGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  thumb: { width: 92, height: 92, borderRadius: 12, backgroundColor: colors.bg2, borderWidth: 1, borderColor: colors.border },
  actions: { marginTop: spacing.lg, gap: spacing.sm },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.lg },
  centerText: { color: colors.muted },
  errorText: { color: colors.dangerText, fontWeight: "900", textAlign: "center" },
});

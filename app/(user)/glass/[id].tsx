import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Button from "../../../src/components/Button";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";
import { getGlassApi, Glass } from "../../../src/api/glassesApi";
import { useCollection } from "../../../src/store/useCollection";

export default function GlassDetailUserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const glassId = Number(id);

  const { has, toggle, refresh } = useCollection();

  const [glass, setGlass] = useState<Glass | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      // On recharge la collection pour être sûr que le bouton reflète l'état réel
      await refresh();
      const g = await getGlassApi(glassId);
      setGlass(g);
    } catch (e: any) {
      setError(e?.message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [glassId]);

  const inCollection = has(glassId);

  const primaryImage = useMemo(() => {
    return glass?.images?.find((img) => img.isPrimary)?.url || glass?.images?.[0]?.url;
  }, [glass]);

  async function onToggle() {
    try {
      setSaving(true);
      setError(null);
      await toggle(glassId);
      // après toggle, le store refresh déjà, donc l’état est correct
    } catch (e: any) {
      setError(e?.message || "Erreur action collection");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.centerText}>Chargement…</Text>
      </View>
    );
  }

  if (error || !glass) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || "Verre introuvable"}</Text>
        <Text style={styles.retry} onPress={load}>
          Réessayer
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xl }}>
      {primaryImage ? (
        <Image source={{ uri: primaryImage }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={{ color: colors.muted }}>Aucune image</Text>
        </View>
      )}

      <Text style={styles.title}>{glass.name}</Text>
      <Text style={styles.brand}>{glass.Manufacturer?.name || "—"}</Text>

      {glass.description ? <Text style={styles.description}>{glass.description}</Text> : null}

      <View style={{ marginTop: spacing.xl }}>
        <Button
          label={inCollection ? "Retirer de ma collection" : "Ajouter à ma collection"}
          variant={inCollection ? "secondary" : "primary"}
          onPress={onToggle}
          disabled={saving}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: spacing.lg },
  centerText: { color: colors.muted },
  errorText: { color: "#991B1B", fontWeight: "700", textAlign: "center" },
  retry: { color: colors.primaryDark, fontWeight: "800" },

  image: {
    height: 220,
    borderRadius: 14,
    marginBottom: spacing.lg,
    backgroundColor: colors.card,
  },
  imagePlaceholder: {
    height: 220,
    backgroundColor: colors.card,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { fontSize: typography.h1, fontWeight: "800", color: colors.text },
  brand: { marginTop: 6, color: colors.muted },
  description: { marginTop: spacing.md, fontSize: typography.body, color: colors.text, lineHeight: 20 },
});

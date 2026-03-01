import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  Pressable,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
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

      await refresh(); // garantit état collection
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
    return (
      glass?.images?.find((img) => img.isPrimary)?.url ||
      glass?.images?.[0]?.url
    );
  }, [glass]);

  async function onToggle() {
    try {
      setSaving(true);
      setError(null);
      await toggle(glassId);
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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>
          Détail du verre
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Image */}
      <View style={styles.imageWrap}>
        {primaryImage ? (
          <Image source={{ uri: primaryImage }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imageEmoji}>🍺</Text>
            <Text style={{ color: colors.muted }}>Aucune image</Text>
          </View>
        )}

        <View style={styles.badge}>
          <Text style={styles.badgeText}>Validé</Text>
        </View>
      </View>

      {/* Paper details */}
      <View style={styles.paper}>
        <Text style={styles.title}>{glass.name}</Text>
        <Text style={styles.brand}>{glass.Manufacturer?.name || "—"}</Text>

        {glass.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{glass.description}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collection</Text>
          <Text style={styles.muted}>
            {inCollection
              ? "Ce verre est déjà dans votre collection."
              : "Ajoutez ce verre à votre collection personnelle."}
          </Text>
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <Button
            label={saving ? "..." : inCollection ? "Retirer de ma collection" : "Ajouter à ma collection"}
            variant={inCollection ? "secondary" : "primary"}
            onPress={onToggle}
            disabled={saving}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  topBar: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadow as any,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  backText: { fontSize: 26, fontWeight: "900", color: colors.text, marginTop: -2 },
  topTitle: { fontSize: 16, fontWeight: "900", color: colors.text },

  imageWrap: {
    marginHorizontal: spacing.lg,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    shadowColor: colors.shadow as any,
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
    position: "relative",
  },
  image: { width: "100%", height: 260, backgroundColor: colors.card },
  imagePlaceholder: {
    height: 260,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.bg2,
  },
  imageEmoji: { fontSize: 44 },

  badge: {
    position: "absolute",
    left: spacing.md,
    bottom: spacing.md,
    backgroundColor: "#5B3A1E",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { color: "#FFF", fontWeight: "900", fontSize: 12 },

  paper: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow as any,
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },

  title: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
  },
  brand: {
    marginTop: spacing.xs,
    color: colors.muted,
    textAlign: "center",
    fontWeight: "700",
  },

  section: { marginTop: spacing.lg },
  sectionTitle: { fontSize: 14, fontWeight: "900", color: colors.text, marginBottom: spacing.xs },
  description: { color: colors.text, lineHeight: 20 },
  muted: { color: colors.muted, lineHeight: 20 },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: spacing.lg },
  centerText: { color: colors.muted },
  errorText: { color: colors.dangerText, fontWeight: "900", textAlign: "center" },
  retry: { color: colors.primaryDark, fontWeight: "900" },
});
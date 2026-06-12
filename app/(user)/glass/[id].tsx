import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View, Text, StyleSheet, ActivityIndicator, Image, ScrollView, Pressable, Modal, FlatList, Dimensions, Platform, ToastAndroid, Alert } from "react-native";
import Button from "../../../src/components/Button";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { getGlassApi, Glass, rateGlassApi } from "../../../src/api/glassesApi";
import { useCollection } from "../../../src/store/useCollection";
import { useAuth } from "../../../src/store/useAuth";
import { openMessageConversationApi } from "../../../src/api/messagesApi";

function showToast(msg: string) {
  if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
  else Alert.alert("Info", msg);
}

export default function GlassDetailUserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const glassId = Number(id);
  const { user } = useAuth();
  const { has, toggle, refresh } = useCollection();

  const [glass, setGlass] = useState<Glass | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [myRating, setMyRating] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [contactingAdmin, setContactingAdmin] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      await refresh();
      const g = await getGlassApi(glassId);
      setGlass(g);
      setMyRating(g.myRating ?? null);
      setSelectedRating(null);
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
  const isOwner = (glass?.createdBy?.id != null) && (glass.createdBy.id === (user as any)?.id);
  const isAdmin = user?.role === "ADMIN";

  const primaryImage = useMemo(() => {
    return glass?.images?.find((img) => img.isPrimary)?.url || glass?.images?.[0]?.url;
  }, [glass]);

  const imageUrls = useMemo(() => (glass?.images || []).map((i) => i.url), [glass]);

  async function onToggle() {
    try {
      setSaving(true);
      setError(null);
      await toggle(glassId);
      await refresh();
      showToast(inCollection ? "Retiré de votre collection" : "Ajouté à votre collection");
    } catch (e: any) {
      setError(e?.message || "Erreur action collection");
    } finally {
      setSaving(false);
    }
  }

  async function onRate() {
    if (isOwner || myRating != null || selectedRating == null) return;
    try {
      setRatingSubmitting(true);
      setError(null);
      const r = await rateGlassApi(glassId, selectedRating);
      setMyRating(r.myRating);
      setSelectedRating(null);
      setGlass((prev) => (prev ? { ...prev, avgRating: r.avgRating, ratingsCount: r.ratingsCount, myRating: r.myRating } : prev));
    } catch (e: any) {
      setError(e?.message || "Échec de la notation");
    } finally {
      setRatingSubmitting(false);
    }
  }


  async function onContactAdmin() {
    try {
      setContactingAdmin(true);
      const conversation = await openMessageConversationApi({ targetType: "GLASS", targetId: glassId });
      router.push({ pathname: "/(user)/chat/[id]", params: { id: String(conversation.id) } } as any);
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de contacter l'administrateur");
    } finally {
      setContactingAdmin(false);
    }
  }

  function Stars({ value, size = 16, tint = colors.primaryDark }: { value: number; size?: number; tint?: string }) {
    const full = Math.round(value);
    return <Text style={{ fontSize: size, color: tint }}>{Array.from({ length: 5 }).map((_, i) => (i < full ? "★" : "☆")).join("")}</Text>;
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
        <Text style={styles.retry} onPress={load}>Réessayer</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={20} color={colors.text as any} />
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>Détail du verre</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.imageWrap}>
        {primaryImage ? (
          <Pressable onPress={() => { const idx = Math.max(0, imageUrls.findIndex((u) => u === primaryImage)); setViewerIndex(idx); setViewerVisible(true); }}>
            <Image source={{ uri: primaryImage }} style={styles.image} />
          </Pressable>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imageEmoji}>🍺</Text>
            <Text style={{ color: colors.muted }}>Aucune image</Text>
          </View>
        )}
        <View style={styles.badge}><Text style={styles.badgeText}>Validé</Text></View>
      </View>

      <View style={styles.paper}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={styles.title}>Détail du verre</Text>
          {glass?.createdBy ? (
            <Pressable onPress={() => router.push({ pathname: "/(user)/profile/[id]", params: { id: String(glass.createdBy.id) } } as any)} hitSlop={10}>
              <Text style={{ color: colors.primaryDark, fontWeight: "900" }}>Ajouté par {glass.createdBy.username}</Text>
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.title}>{glass.name}</Text>
        <Text style={styles.brand}>{glass.Manufacturer?.name || "—"}</Text>

        <View style={[styles.section, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}> 
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Stars value={Number(glass.avgRating || 0)} />
            <Text style={{ color: colors.muted, fontSize: 12 }}>({glass.ratingsCount || 0})</Text>
          </View>
          {!isOwner ? (
            myRating != null ? (
              <View style={styles.ratingBox}>
                <Text style={styles.ratingLabel}>Votre note</Text>
                <Stars value={myRating} size={18} />
              </View>
            ) : (
              <View style={styles.ratingBox}>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Text key={n} onPress={() => setSelectedRating(n)} style={{ color: (selectedRating || 0) >= n ? colors.primaryDark : colors.text, fontSize: 22 }}>★</Text>
                  ))}
                </View>
                <Button
                  label={ratingSubmitting ? "Validation..." : "Valider ma note"}
                  onPress={onRate}
                  disabled={selectedRating == null || ratingSubmitting}
                  style={styles.ratingButton}
                />
              </View>
            )
          ) : null}
        </View>


        {glass.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{glass.description}</Text>
          </View>
        ) : null}

        {!isAdmin && isOwner ? (
          <View style={{ marginTop: spacing.lg }}>
            <Button label={contactingAdmin ? "Ouverture..." : "Contacter l'admin au sujet de ce verre"} variant="secondary" onPress={onContactAdmin} disabled={contactingAdmin} />
          </View>
        ) : null}

        {isOwner ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Collection</Text>
              <Text style={styles.muted}>{inCollection ? "Ce verre est déjà dans votre collection." : "Ajoutez ce verre à votre collection personnelle."}</Text>
            </View>
            <View style={{ marginTop: spacing.lg }}>
              <Button
                label={saving ? "..." : inCollection ? "Retirer de ma collection" : "Ajouter à ma collection"}
                variant={inCollection ? "secondary" : "primary"}
                onPress={onToggle}
                disabled={saving}
              />
            </View>
          </>
        ) : null}
      </View>

      <Modal visible={viewerVisible} transparent animationType="fade" onRequestClose={() => setViewerVisible(false)}>
        <View style={styles.viewerOverlay}>
          <FlatList
            horizontal
            pagingEnabled
            data={imageUrls}
            keyExtractor={(u, i) => u + String(i)}
            initialScrollIndex={viewerIndex}
            getItemLayout={(data, index) => { const width = Dimensions.get("window").width; return { length: width, offset: width * index, index }; }}
            renderItem={({ item }) => (
              <View style={{ width: Dimensions.get("window").width, height: Dimensions.get("window").height, alignItems: "center", justifyContent: "center", backgroundColor: "black" }}>
                <Image source={{ uri: item }} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
              </View>
            )}
          />
          <Pressable onPress={() => setViewerVisible(false)} style={styles.viewerClose} hitSlop={10}>
            <Text style={styles.viewerCloseText}>×</Text>
          </Pressable>
        </View>
      </Modal>
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
    backgroundColor: colors.badgeBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { color: colors.badgeText, fontWeight: "900", fontSize: 12 },
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
  title: { fontSize: 22, fontWeight: "900", color: colors.text, textAlign: "center" },
  brand: { marginTop: spacing.xs, color: colors.muted, textAlign: "center", fontWeight: "700" },
  section: { marginTop: spacing.lg },
  sectionTitle: { fontSize: 14, fontWeight: "900", color: colors.text, marginBottom: spacing.xs },
  description: { color: colors.text, lineHeight: 20 },
  muted: { color: colors.muted, lineHeight: 20 },
  ratingBox: { alignItems: "flex-end", gap: spacing.sm },
  ratingLabel: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  ratingButton: { minWidth: 140 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: spacing.lg },
  centerText: { color: colors.muted },
  errorText: { color: colors.dangerText, fontWeight: "900", textAlign: "center" },
  retry: { color: colors.primaryDark, fontWeight: "900" },
  viewerOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", alignItems: "center", justifyContent: "center" },
  viewerClose: { position: "absolute", top: spacing.xl, right: spacing.xl, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" },
  viewerCloseText: { color: "#000", fontSize: 22, fontWeight: "900", marginTop: -2 },
});




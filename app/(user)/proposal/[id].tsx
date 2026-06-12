import React, { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ActivityIndicator, FlatList, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View, Dimensions } from "react-native";
import Button from "../../../src/components/Button";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { listMyProposalsApi, MyProposal } from "../../../src/api/proposalsApi";
import { useCollection } from "../../../src/store/useCollection";

function badge(status?: string) {
  if (status === "VALIDE") return { bg: colors.successBg, text: colors.successText, label: "Validé" };
  if (status === "REJETE") return { bg: colors.dangerBg, text: colors.dangerText, label: "Rejeté" };
  return { bg: colors.warningBg, text: colors.warningText, label: "En attente" };
}

export default function ProposalDetailScreen() {
  const { id, proposal } = useLocalSearchParams<{ id: string; proposal?: string }>();
  const proposalId = Number(id);
  const { has, toggle, refresh } = useCollection();
  const [item, setItem] = useState<MyProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const proposalFromParams = useMemo(() => {
    if (!proposal || Array.isArray(proposal)) return null;
    try {
      const parsed = JSON.parse(proposal);
      return parsed as MyProposal;
    } catch {
      return null;
    }
  }, [proposal]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        if (proposalFromParams && Number(proposalFromParams.id) === proposalId) {
          setItem(proposalFromParams);
        }
        await refresh();
        const res = await listMyProposalsApi();
        const found = (res.items || []).find((entry) => Number(entry.id) === proposalId) || null;
        if (!found) {
          if (!proposalFromParams || Number(proposalFromParams.id) !== proposalId) {
            setError("Proposition introuvable");
            setItem(null);
          }
        } else {
          setItem(found);
        }
      } catch (e: any) {
        if (!proposalFromParams) {
          setError(e?.message || "Erreur de chargement");
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [proposalId, proposalFromParams, refresh]);

  const imageUrls = useMemo(() => (item?.images || []).map((image) => image.url), [item]);
  const primaryImage = imageUrls[0] || null;
  const inCollection = has(proposalId);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator /><Text style={styles.centerText}>Chargement...</Text></View>;
  }

  if (error || !item) {
    return <View style={styles.center}><Text style={styles.errorText}>{error || "Proposition introuvable"}</Text></View>;
  }

  const b = badge(item.status);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => {
            if (item?.status === "EN_ATTENTE") {
              router.replace({ pathname: "/(user)/(tabs)/collection", params: { filter: "pending" } } as any);
              return;
            }
            router.back();
          }}
          style={styles.backBtn}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text as any} />
        </Pressable>
        <Text style={styles.topTitle}>Détail de la proposition</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.imageWrap}>
        {primaryImage ? (
          <Pressable onPress={() => { setViewerIndex(0); setViewerVisible(true); }}>
            <Image source={{ uri: primaryImage }} style={styles.image} />
          </Pressable>
        ) : (
          <View style={styles.imagePlaceholder}><Text style={styles.imageEmoji}>🍺</Text><Text style={styles.muted}>Aucune image</Text></View>
        )}
        <View style={[styles.badge, { backgroundColor: b.bg }]}><Text style={[styles.badgeText, { color: b.text }]}>{b.label}</Text></View>
      </View>

      <View style={styles.paper}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.brand}>{item.Manufacturer?.name || "—"}</Text>

        {item.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        ) : null}

        {item.status === "REJETE" && item.rejectReason ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Raison du rejet</Text>
            <Text style={styles.reject}>{item.rejectReason}</Text>
          </View>
        ) : null}

        {item.status === "EN_ATTENTE" ? (
          <View style={styles.section}>
            <Button
              label="Modifier"
              onPress={() => router.push({ pathname: "/(user)/proposal-edit/[id]", params: { id: String(item.id) } } as any)}
            />
          </View>
        ) : null}

        {item.status === "VALIDE" ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Collection</Text>
            <Text style={styles.muted}>{inCollection ? "Ce verre est déjà dans votre collection." : "Vous pouvez ajouter ce verre validé à votre collection."}</Text>
            <View style={{ marginTop: spacing.md }}>
              <Button
                label={saving ? "..." : inCollection ? "Retirer de ma collection" : "Ajouter à ma collection"}
                variant={inCollection ? "secondary" : "primary"}
                disabled={saving}
                onPress={async () => {
                  try {
                    setSaving(true);
                    await toggle(proposalId);
                    await refresh();
                  } finally {
                    setSaving(false);
                  }
                }}
              />
            </View>
          </View>
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
            renderItem={({ item: imageUrl }) => (
              <View style={{ width: Dimensions.get("window").width, height: Dimensions.get("window").height, alignItems: "center", justifyContent: "center", backgroundColor: "black" }}>
                <Image source={{ uri: imageUrl }} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
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
  topBar: { paddingTop: spacing.xl, paddingHorizontal: spacing.lg, paddingBottom: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", shadowColor: colors.shadow as any, shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  topTitle: { fontSize: 16, fontWeight: "900", color: colors.text },
  imageWrap: { marginHorizontal: spacing.lg, borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, shadowColor: colors.shadow as any, shadowOpacity: 0.22, shadowRadius: 14, shadowOffset: { width: 0, height: 10 }, elevation: 4, position: "relative" },
  image: { width: "100%", height: 260, backgroundColor: colors.card },
  imagePlaceholder: { height: 260, alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: colors.bg2 },
  imageEmoji: { fontSize: 44 },
  badge: { position: "absolute", left: spacing.md, bottom: spacing.md, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  badgeText: { fontWeight: "900", fontSize: 12 },
  paper: { marginTop: spacing.lg, marginHorizontal: spacing.lg, padding: spacing.lg, borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, shadowColor: colors.shadow as any, shadowOpacity: 0.14, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 2 },
  title: { fontSize: 22, fontWeight: "900", color: colors.text, textAlign: "center" },
  brand: { marginTop: spacing.xs, color: colors.muted, textAlign: "center", fontWeight: "700" },
  section: { marginTop: spacing.lg },
  sectionTitle: { fontSize: 14, fontWeight: "900", color: colors.text, marginBottom: spacing.xs },
  description: { color: colors.text, lineHeight: 20 },
  reject: { color: colors.dangerText, lineHeight: 20, fontWeight: "700" },
  muted: { color: colors.muted, lineHeight: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: spacing.lg },
  centerText: { color: colors.muted },
  errorText: { color: colors.dangerText, fontWeight: "900", textAlign: "center" },
  viewerOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", alignItems: "center", justifyContent: "center" },
  viewerClose: { position: "absolute", top: spacing.xl, right: spacing.xl, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" },
  viewerCloseText: { color: "#000", fontSize: 22, fontWeight: "900", marginTop: -2 },
});

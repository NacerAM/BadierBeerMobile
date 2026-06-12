import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import Input from "../../../src/components/Input";
import Button from "../../../src/components/Button";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { listMyProposalsApi, updateMyProposalApi, MyProposal } from "../../../src/api/proposalsApi";
import { uploadImageApi } from "../../../src/api/uploadApi";

export default function ProposalEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const proposalId = Number(id);
  const [proposal, setProposal] = useState<MyProposal | null>(null);
  const [name, setName] = useState("");
  const [manufacturerName, setManufacturerName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const primaryImage = useMemo(() => imageUrls[0] || null, [imageUrls]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listMyProposalsApi();
      const item = (res.items || []).find((entry) => Number(entry.id) === proposalId) || null;
      if (!item) {
        setProposal(null);
        setError("Proposition introuvable");
        return;
      }
      if (item.status !== "EN_ATTENTE") {
        setProposal(null);
        setError("Seules les propositions en attente peuvent etre modifiees");
        return;
      }
      setProposal(item);
      setName(item.name || "");
      setManufacturerName(item.Manufacturer?.name || "");
      setDescription(item.description || "");
      const orderedImages = [...(item.images || [])].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
      setImageUrls(orderedImages.map((img) => img.url));
    } catch (e: any) {
      setError(e?.message || "Impossible de charger cette proposition");
    } finally {
      setLoading(false);
    }
  }, [proposalId]);

  useEffect(() => {
    load();
  }, [load]);

  async function onPickImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.9,
        allowsMultipleSelection: false,
      });
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      setUploading(true);
      const uploaded = await uploadImageApi({
        uri: asset.uri,
        fileName: asset.fileName || `proposal-${Date.now()}.jpg`,
        mimeType: asset.mimeType || "image/jpeg",
        file: (asset as any).file,
      });
      setImageUrls((current) => [...current, uploaded.url]);
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible d'importer l'image");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    setImageUrls((current) => current.filter((item) => item !== url));
  }

  function makePrimary(url: string) {
    setImageUrls((current) => [url, ...current.filter((item) => item !== url)]);
  }

  async function onSave() {
    if (!name.trim()) {
      Alert.alert("Erreur", "Le nom du verre est requis");
      return;
    }
    if (!manufacturerName.trim()) {
      Alert.alert("Erreur", "Le fabricant est requis");
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      Alert.alert("Erreur", "La description est trop courte");
      return;
    }
    if (!imageUrls.length) {
      Alert.alert("Erreur", "Au moins une image est requise");
      return;
    }
    try {
      setSaving(true);
      await updateMyProposalApi(proposalId, {
        name: name.trim(),
        manufacturerName: manufacturerName.trim(),
        description: description.trim(),
        imageUrls,
      });
      Alert.alert("Enregistre", "Votre proposition a ete modifiee", [
        { text: "OK", onPress: () => router.replace({ pathname: "/(user)/(tabs)/collection", params: { filter: "pending" } } as any) },
      ]);
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de modifier cette proposition");
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

  if (error || !proposal) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || "Proposition introuvable"}</Text>
        <Button label="Reessayer" onPress={load} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.replace({ pathname: "/(user)/(tabs)/collection", params: { filter: "pending" } } as any)} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={20} color={colors.text as any} />
        </Pressable>
        <Text style={styles.topTitle}>Modifier la proposition</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.card}>
        <View style={styles.heroWrap}>
          {primaryImage ? <Image source={{ uri: primaryImage }} style={styles.heroImage} resizeMode="cover" /> : <Text style={styles.imageEmoji}>?</Text>}
        </View>
        <Text style={styles.meta}>Proposition en attente</Text>

        <Input label="Nom" value={name} onChangeText={setName} />
        <Input label="Fabricant" value={manufacturerName} onChangeText={setManufacturerName} />
        <Input label="Description" value={description} onChangeText={setDescription} multiline style={styles.multilineInput} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Images</Text>
          <Text style={styles.helper}>La premiere image est l'image principale.</Text>
          <View style={styles.imagesGrid}>
            {imageUrls.map((url, index) => (
              <View key={`${url}-${index}`} style={styles.imageCard}>
                <Image source={{ uri: url }} style={styles.thumb} resizeMode="cover" />
                {index === 0 ? <Text style={styles.primaryBadge}>Principale</Text> : null}
                <View style={styles.imageActions}>
                  {index !== 0 ? <Button label="Mettre en premier" variant="secondary" onPress={() => makePrimary(url)} disabled={saving || uploading} /> : null}
                  <Button label="Supprimer" variant="secondary" onPress={() => removeImage(url)} disabled={saving || uploading} />
                </View>
              </View>
            ))}
          </View>
          <Button label={uploading ? "Import..." : "Ajouter une image"} onPress={onPickImage} disabled={saving || uploading} style={styles.addImageButton} />
        </View>

        <View style={styles.actions}>
          <Button label={saving ? "Validation..." : "Valider les modifications"} onPress={onSave} disabled={saving || uploading} />
          <Button label="Annuler" variant="secondary" onPress={() => router.back()} disabled={saving || uploading} />
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
  heroWrap: { height: 220, borderRadius: 14, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: colors.bg2, marginBottom: spacing.md },
  heroImage: { width: "100%", height: "100%" },
  imageEmoji: { fontSize: 40, color: colors.muted },
  meta: { color: colors.muted, fontWeight: "700", marginBottom: spacing.xs },
  multilineInput: { minHeight: 110, textAlignVertical: "top" },
  section: { marginTop: spacing.md },
  sectionTitle: { fontSize: 14, fontWeight: "900", color: colors.text, marginBottom: spacing.xs },
  helper: { color: colors.muted, marginBottom: spacing.sm },
  imagesGrid: { gap: spacing.md },
  imageCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing.sm, backgroundColor: colors.bg2 },
  thumb: { width: "100%", height: 180, borderRadius: 10, backgroundColor: colors.card },
  primaryBadge: { marginTop: spacing.sm, alignSelf: "flex-start", backgroundColor: colors.badgeBg, color: colors.badgeText, fontWeight: "900", fontSize: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  imageActions: { marginTop: spacing.sm, gap: spacing.sm },
  addImageButton: { marginTop: spacing.sm },
  actions: { marginTop: spacing.lg, gap: spacing.sm },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.lg },
  centerText: { color: colors.muted },
  errorText: { color: colors.dangerText, fontWeight: "900", textAlign: "center" },
});

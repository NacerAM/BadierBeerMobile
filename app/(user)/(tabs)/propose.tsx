import React, { useState } from "react";
import { Text, StyleSheet, ScrollView, Alert, View, Pressable, Platform, ToastAndroid } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Modal, FlatList, Dimensions } from "react-native";
import Input from "../../../src/components/Input";
import Button from "../../../src/components/Button";
import MultiImageUploadField from "../../../src/components/MultiImageUploadField";
import { proposeGlassApi } from "../../../src/api/proposalsApi";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";

function showToast(msg: string) { if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT); else Alert.alert("Info", msg); }

export default function ProposeScreen() {
  const [name, setName] = useState("");
  const [manufacturerName, setManufacturerName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [viewerVisible, setViewerVisible] = useState(false);

  const [viewerIndex, setViewerIndex] = useState(0);

  function sanitizeUrls() {
    return imageUrls.map((u) => u.trim()).filter(Boolean);
  }

  function validate() {
    if (!name.trim()) return "Nom du verre requis";
    if (!manufacturerName.trim()) return "Fabricant requis";
    if (!description.trim()) return "Description requise";
    if (description.trim().length < 5) return "Description trop courte";

    const urls = sanitizeUrls();
    if (urls.length === 0) return "Au moins une image est requise";
    return null;
  }

  async function onSubmit() {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const urls = sanitizeUrls();
      await proposeGlassApi({
        name: name.trim(),
        manufacturerName: manufacturerName.trim(),
        description: description.trim(),
        imageUrls: urls,
      });

      showToast('Votre proposition a été envoyée pour validation.');
      setName("");
      setManufacturerName("");
      setDescription("");
      setImageUrls([]);

      router.push({ pathname: "/(user)/(tabs)/collection", params: { filter: "pending" } } as any);
    } catch (e: any) {
      setError(e?.message || "Erreur lors de l’envoi");
    } finally {
      setLoading(false);
    }
  }

  const cleanUrls = sanitizeUrls();



  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.push("/(user)/(tabs)/brewer" as any)} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={20} color={colors.text as any} />
        </Pressable>
        <Text style={styles.title}>Proposer un verre</Text>
        <View style={{ width: 40 }} />
      </View>
      <Text style={styles.subtitle}>
        Remplissez les informations. La proposition sera examinée par un administrateur.
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Input label="Nom du verre" value={name} onChangeText={setName} />
      <Input label="Fabricant" value={manufacturerName} onChangeText={setManufacturerName} />

      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        style={{ minHeight: 90, textAlignVertical: "top" } as any}
      />

      <MultiImageUploadField label="Images du verre" values={imageUrls} onChange={setImageUrls} />

      <Button
        label={loading ? "Envoi..." : "Envoyer la proposition"}
        onPress={onSubmit}
        disabled={loading}
      />
      <Modal visible={viewerVisible} transparent animationType="fade" onRequestClose={() => setViewerVisible(false)}>
      <View style={styles.viewerOverlay}>
        <FlatList
          horizontal
          pagingEnabled
          data={cleanUrls}
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
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.bg },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.lg, marginTop: spacing.lg },
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
  title: { fontSize: typography.h1, fontWeight: "800", color: colors.text },
  subtitle: { color: colors.muted, marginBottom: spacing.lg },
  error: { color: colors.dangerText, fontWeight: "700", marginBottom: spacing.md },
  viewerOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", alignItems: "center", justifyContent: "center" },
  viewerClose: { position: "absolute", top: spacing.xl, right: spacing.xl, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" },
  viewerCloseText: { color: "#000", fontSize: 22, fontWeight: "900", marginTop: -2 },
});













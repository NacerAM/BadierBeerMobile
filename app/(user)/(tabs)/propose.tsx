import React, { useState } from "react";
import { Text, StyleSheet, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import Input from "../../../src/components/Input";
import Button from "../../../src/components/Button";
import { proposeGlassApi } from "../../../src/api/proposalsApi";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";

export default function ProposeScreen() {
  const [name, setName] = useState("");
  const [manufacturerName, setManufacturerName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // simple pour V1

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validate() {
    if (!name.trim()) return "Nom du verre requis";
    if (!manufacturerName.trim()) return "Fabricant requis";
    if (description.trim().length > 0 && description.trim().length < 5) return "Description trop courte";
    if (imageUrl.trim().length > 0 && !imageUrl.trim().startsWith("http")) return "URL image invalide";
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

      await proposeGlassApi({
        name: name.trim(),
        manufacturerName: manufacturerName.trim(),
        description: description.trim() ? description.trim() : undefined,
        imageUrls: imageUrl.trim() ? [imageUrl.trim()] : undefined,
      });

      Alert.alert("Envoyé ✅", "Votre proposition a été envoyée pour validation.");
      setName("");
      setManufacturerName("");
      setDescription("");
      setImageUrl("");

      router.push("/(user)/proposals" as any);
    } catch (e: any) {
      setError(e?.message || "Erreur lors de l’envoi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <Text style={styles.title}>Proposer un verre</Text>
      <Text style={styles.subtitle}>
        Remplissez les informations. La proposition sera examinée par un administrateur.
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Input label="Nom du verre" value={name} onChangeText={setName} />
      <Input label="Fabricant" value={manufacturerName} onChangeText={setManufacturerName} />

      <Input
        label="Description (optionnel)"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        style={{ minHeight: 90, textAlignVertical: "top" } as any}
      />

      <Input
        label="URL image (optionnel)"
        value={imageUrl}
        onChangeText={setImageUrl}
        autoCapitalize="none"
      />

      <Button
        label={loading ? "Envoi..." : "Envoyer la proposition"}
        onPress={onSubmit}
        disabled={loading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.bg },
  title: { fontSize: typography.h1, fontWeight: "800", color: colors.text, marginBottom: spacing.sm },
  subtitle: { color: colors.muted, marginBottom: spacing.lg },
  error: { color: colors.dangerText, fontWeight: "700", marginBottom: spacing.md },
});

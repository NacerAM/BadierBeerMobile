import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";
import Input from "../../src/components/Input";
import Button from "../../src/components/Button";
import { useProposals } from "../../src/store/useProposals";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";
import { router } from "expo-router";

export default function ProposeGlassScreen() {
  const { addProposal } = useProposals();

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");

  const [errors, setErrors] = useState<{ name?: string; brand?: string; description?: string }>({});

  function onSubmit() {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Nom du verre requis";
    if (!brand.trim()) e.brand = "Fabricant requis";
    if (!description.trim()) e.description = "Description requise";
    setErrors(e);

    if (Object.keys(e).length !== 0) return;

    addProposal({ name, brand, description });

    Alert.alert("Envoyé ✅", "Votre proposition a été envoyée pour validation.");
    setName("");
    setBrand("");
    setDescription("");

    router.push("/(user)/proposals" as any);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <Text style={styles.title}>Proposer un verre</Text>
      <Text style={styles.subtitle}>
        Complétez les informations. La proposition sera validée par un administrateur.
      </Text>

      <Input label="Nom du verre" value={name} onChangeText={setName} error={errors.name} />
      <Input label="Fabricant" value={brand} onChangeText={setBrand} error={errors.brand} />

      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
        error={errors.description}
        multiline
        numberOfLines={4}
        style={{ minHeight: 90, textAlignVertical: "top" } as any}
      />

      <Button label="Envoyer la proposition" onPress={onSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.bg },
  title: { fontSize: typography.h1, fontWeight: "800", color: colors.text, marginBottom: spacing.sm },
  subtitle: { color: colors.muted, marginBottom: spacing.lg },
});

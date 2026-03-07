import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";
import Input from "../../../src/components/Input";
import Button from "../../../src/components/Button";
import { changePasswordApi } from "../../../src/api/authApi";
import { router } from "expo-router";

export default function SettingsScreen() {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{old?: string; password?: string; confirm?: string}>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: typeof errors = {};
    if (!oldPassword.trim()) e.old = "Ancien mot de passe requis";
    if (!password.trim()) e.password = "Nouveau mot de passe requis";
    if (password && password.length < 8) e.password = "Minimum 8 caractères";
    if (confirm !== password) e.confirm = "Les mots de passe ne correspondent pas";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit() {
    if (!validate()) return;
    try {
      setLoading(true);
      const res = await changePasswordApi(oldPassword.trim(), password.trim());
      Alert.alert("Succès", res.message || "Mot de passe mis à jour");
      setOldPassword(""); setPassword(""); setConfirm("");
    } catch (e: any) {
      const msg = e?.data?.message || e?.message || "Erreur inconnue";
      if (msg.toLowerCase().includes("ancien mot de passe")) {
        setErrors({ old: msg });
      } else {
        Alert.alert("Erreur", msg);
      }
    } finally { setLoading(false); }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.push("/(user)/(tabs)/profile" as any)} hitSlop={10}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.topTitle}>Favoris et paramètres</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Changer le mot de passe</Text>
        <Input label="Ancien mot de passe" value={oldPassword} onChangeText={setOldPassword} secureTextEntry error={errors.old} />
        <Input label="Nouveau mot de passe" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} />
        <Input label="Confirmer le mot de passe" value={confirm} onChangeText={setConfirm} secureTextEntry error={errors.confirm} />
        <Button label={loading ? "Modification..." : "Modifier le mot de passe"} onPress={onSubmit} disabled={loading} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: { paddingTop: spacing.xl, paddingBottom: spacing.md, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg },
  topTitle: { fontSize: typography.h1, fontWeight: '900', color: colors.text },
  back: { fontSize: 28, color: colors.text, fontWeight: '900' },
  card: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow as any,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  sectionTitle: { fontWeight: '900', color: colors.text, marginBottom: spacing.sm, fontSize: 16 },
});

import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";
import Input from "../../../src/components/Input";
import Button from "../../../src/components/Button";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";
import { useAuth } from "../../../src/store/useAuth";
import { router } from "expo-router";
import { updateMeApi } from "../../../src/api/authApi";

export default function EditProfileScreen() {
  const { user, token, login } = useAuth();
  const [username, setUsername] = useState(user?.username || "");
  const [avatarUrl, setAvatarUrl] = useState((user as any)?.avatarUrl || "");
  const [bio, setBio] = useState((user as any)?.bio || "");

  async function onSave() {
    const u = username.trim();
    if (!u) {
      Alert.alert("Erreur", "Nom d'utilisateur requis");
      return;
    }
    try {
      const payload: any = { username: u };
      const url = (avatarUrl || '').trim();
      if (url) payload.avatarUrl = url; else payload.avatarUrl = null; payload.bio = bio.trim() ? bio.trim() : null;

      const updated = await updateMeApi(payload);
      await login({ token: token!, user: { ...(user as any), ...updated } });
      Alert.alert("Profil", "Modifications enregistrées");
      router.back();
    } catch (e: any) {
      const status = e?.status as number | undefined;
      if (status === 409) {
        Alert.alert("Nom déjà pris", "Veuillez choisir un autre nom d'utilisateur");
      } else {
        Alert.alert("Erreur", e?.message || "Échec de sauvegarde");
      }
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <Text style={styles.title}>Éditer le profil</Text>

      <Input label="Nom d'utilisateur" value={username} onChangeText={setUsername} autoCapitalize="none" />
      <Input label="URL de la photo (optionnel)" value={avatarUrl} onChangeText={setAvatarUrl} autoCapitalize="none" />

      <Input label="Présentation (bio)" value={bio} onChangeText={setBio} multiline numberOfLines={4} style={{ minHeight: 100, textAlignVertical: "top" }} />

      <Button label="Enregistrer" onPress={onSave} />
      <View style={{ height: spacing.sm }} />
      <Button label="Annuler" variant="secondary" onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.bg },
  title: { fontSize: typography.h1, fontWeight: "800", color: colors.text, marginBottom: spacing.md },
});
